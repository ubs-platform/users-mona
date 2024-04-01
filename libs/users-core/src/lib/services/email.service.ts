import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { EmailDto } from '../dto/email.dto';

@Injectable()
export class EmailService {
  constructor(
    @Inject('KAFKA_CLIENT')
    private eventClient: ClientKafka
  ) {}

  sendEmail(body: EmailDto) {
    this.eventClient.emit('email-reset', body);
  }
}
