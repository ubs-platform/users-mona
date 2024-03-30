import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../domain/user.model';
import { PwResetRequest } from '../domain/pw-reset-request.schema';
import { UserService } from './user.service';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { EmailDto } from '../dto/email.dto';
import { lastValueFrom } from 'rxjs';
import { exec } from 'child_process';

@Injectable()
export class PasswordResetService {
  constructor(
    private uservice: UserService,
    @InjectModel(PwResetRequest.name)
    private passwordResetModel: Model<PwResetRequest>,
    @Inject('KAFKA_CLIENT')
    private eventClient: ClientKafka
  ) {
    this.eventClient.subscribeToResponseOf('email-reset.reply');
  }

  public async insertNewRequest(username: string, origin?: string) {
    const EXPIRE_AFTER = 120;

    const u = await this.uservice.findUserByLogin({
      login: username,
      password: '',
    });
    await this.passwordResetModel
      .deleteMany({
        $or: [
          {
            expireAfter: {
              $lt: new Date(),
            },
          },
          u?.id
            ? {
                userId: u.id,
              }
            : null,
        ].filter((a) => a),
      })
      .exec();
    if (u) {
      console.info(u);

      const exp = new Date();
      exp.setMinutes(exp.getMinutes() + EXPIRE_AFTER);
      let ech = new this.passwordResetModel();
      ech.expireAfter = exp;
      ech.userId = u.id;
      ech = await ech.save();
      // return { approveId: ech.id };
      exec(`wall ${process.env['U_USERS_PW_RESET_URL']}`);
      this.eventClient.emit('email-reset', {
        templateName: 'ubs-pwreset',
        to: u.primaryEmail,
        subject: 'Password Reset | Tetakent Information Service',
        specialVariables: {
          userfirstname: u.name,
          userlastname: u.surname,
          link:
            origin +
            process.env['U_USERS_PW_RESET_URL']?.replace(':id', ech.id),
        },
      } as EmailDto);
    }
  }

  public async approve(pwResetId: string, newPassword: string) {
    const exist = await this.passwordResetModel.findOne({
      _id: pwResetId,
    });
    console.info('Current email change refresh', exist);
    if (exist) {
      if (new Date() > exist.expireAfter) {
        throw new HttpException('Request expired', 400);
      }
      console.info(exist.userId);
      await this.uservice.changePasswordForgor(exist.userId, newPassword);
      // let user = await this.userService.findUserAuth(exist.userId);
      // user.primaryEmail = exist.userId;
      // user = await this.userService.changeEmail(exist.userId, exist.newEmail);
    } else {
      throw new HttpException('No records found', 404);
    }
  }
}
