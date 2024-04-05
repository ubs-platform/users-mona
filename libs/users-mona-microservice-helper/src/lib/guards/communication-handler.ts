import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

@Injectable()
export class CommunicationHelper {
  constructor(
    @Inject('USER_CLIENT') private userClient: ClientProxy | ClientKafka | any
  ) {}

  sendMessageForResponse<DATA_TYPE, RESPONSE_TYPE>(
    pattern: string,
    data: DATA_TYPE
  ): Observable<RESPONSE_TYPE> {
    if (this.userClient instanceof ClientProxy) {
      return this.userClient.send(pattern, data) as Observable<RESPONSE_TYPE>;
    }
    if (this.userClient instanceof ClientKafka) {
      return this.userClient.send(pattern, data) as Observable<RESPONSE_TYPE>;
    }
    return new Observable((a) => a.error('UBS: Unknown data type'));
  }
}
