import { Injectable } from '@nestjs/common';
import { EmailChangeRequest } from '../domain/email-change-request.schema';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../domain/user.model';
import { UserService } from './user.service';
import { CryptoOp } from '../util/crypto-op';
import { EmailService } from './email.service';

@Injectable()
export class EmailChangeRequestService {
  constructor(
    @InjectModel(EmailChangeRequest.name)
    private echReq: Model<EmailChangeRequest>,
    private userService: UserService,
    private emailService: EmailService
  ) {}

  public async insertNewRequest(
    userId: string,
    newEmail: string
  ): Promise<{ approveId: string }> {
    this.echReq.deleteMany({
      expireAfter: {
        $lt: new Date(),
      },
    });
    if (
      (await this.userService.findByEmailExcludeUserId(newEmail, userId)).length
    ) {
      throw 'email-is-using-already';
    }
    const exp = new Date();
    exp.setMinutes(exp.getMinutes() + 2);
    let ech = new this.echReq();
    ech.newEmail = newEmail;
    ech.userId = userId;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    ech.code = await CryptoOp.encrypt(code); // TODO: Randomize and send email

    ech.expireAfter = exp;
    ech = await ech.save();
    await this.sendMail(userId, newEmail, code);

    return { approveId: ech.id };
  }

  private async sendMail(userId: string, newEmail: string, code: string) {
    const u = await this.userService.findById(userId);

    await this.emailService.sendEmail(
      u,
      'ubs-user-email-change-title',
      'ubs-user-email-change',
      { code }
    );
  }

  public async approveEmailChange(
    userId: string,
    approvementId: string,
    code: string
  ) {
    const exist = await this.echReq.findOne({
      _id: approvementId,
      userId: userId,
    });
    console.info('Current email change refresh', exist);
    if (exist) {
      if (new Date() > exist.expireAfter) {
        throw 'request-expired';
      } else if (exist.code != (await CryptoOp.encrypt(code))) {
        throw 'code-does-not-match';
      }
      let user = await this.userService.findUserAuth(exist.userId);
      user.primaryEmail = exist.userId;
      user = await this.userService.changeEmail(exist.userId, exist.newEmail);
    } else {
      throw 'not-found';
    }
  }
}
