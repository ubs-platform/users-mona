import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from '../domain/user.model';
import { PwResetRequest } from '../domain/pw-reset-request.schema';
import { UserService } from './user.service';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { EmailDto } from '../dto/email.dto';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class PasswordResetService {
  constructor(
    private uservice: UserService,
    @InjectModel(PwResetRequest.name)
    private passwordResetModel: Model<PwResetRequest>,
    @Inject('USER_CLIENT')
    private eventClient: ClientKafka
  ) {
    this.eventClient.subscribeToResponseOf('email-reset.reply');
  }

  public async insertNewRequest(username: string) {
    const EXPIRE_AFTER = 120;

    const u = await this.uservice.findUserByLogin({
      login: username,
      password: '',
    });
    this.passwordResetModel.deleteMany({
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
    });
    if (u) {
      console.info(u);

      const exp = new Date();
      exp.setMinutes(exp.getMinutes() + EXPIRE_AFTER);
      let ech = new this.passwordResetModel();
      ech.expireAfter = exp;
      ech.userId = u.id;
      ech = await ech.save();
      // return { approveId: ech.id };
      this.eventClient
        .send('email-reset', {
          templateName: 'ubs-pwreset',
          to: u.primaryEmail,
          subject: 'Reset password on Lotus',
          specialVariables: {
            userfirstname: u.name,
            userlastname: u.surname,
            link: `http://localhost:4200/users/password-reset/${ech.id}`,
          },
        } as EmailDto)
        .toPromise();
    }
  }

  public async approve(pwResetId: string, newPassword: string) {
    const exist = await this.passwordResetModel.findOne({
      _id: pwResetId,
    });
    console.info('Current email change refresh', exist);
    if (exist) {
      if (new Date() > exist.expireAfter) {
        throw 'request-expired';
      }
      this.uservice.changePasswordForgor(exist.id, newPassword);
      // let user = await this.userService.findUserAuth(exist.userId);
      // user.primaryEmail = exist.userId;
      // user = await this.userService.changeEmail(exist.userId, exist.newEmail);
    } else {
      throw 'not-found';
    }
  }
}
