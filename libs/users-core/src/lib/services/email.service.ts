import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { EmailDto } from '../dto/email.dto';
import { UserDTO, UserFullDto } from '@ubs-platform/users-common';
import { User } from '../domain/user.model';

@Injectable()
export class EmailService {
  constructor(
    @Inject('KAFKA_CLIENT')
    private eventClient: ClientKafka
  ) {}

  sendEmail(
    user: UserDTO | UserFullDto | User,
    titleTemplateName: string,
    messageTemplateName: string,
    otherVariables: {}
  ) {
    this.eventClient.emit('email-reset', {
      to: user.primaryEmail,
      language: user.localeCode,
      subject: `{{global:${titleTemplateName}}}`,
      templateName: messageTemplateName,
      specialVariables: {
        ...otherVariables,
        userfirstname: user.name,
        userlastname: user.surname,
      },
    });
  }
}
