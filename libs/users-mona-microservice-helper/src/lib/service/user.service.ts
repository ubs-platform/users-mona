import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientKafka, ClientRMQ } from '@nestjs/microservices';
import { Kafka } from '@nestjs/microservices/external/kafka.interface';
import { UserDTO } from '@ubs-platform/users-common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UserService implements OnModuleInit {
  constructor(
    @Inject('USER_MICROSERVICE')
    private userClient: ClientProxy | ClientKafka | ClientRMQ | any
  ) {}
  onModuleInit() {
    // (this.userClient as ClientKafka).subscribeToResponseOf?.('user-by-id');
  }

  async findUserAuth(userId: any): Promise<UserDTO> {
    console.debug('Fetching user');
    const user = (await firstValueFrom(
      this.userClient.send('user-by-id', userId)
    )) as UserDTO;
    console.debug(`The request made by: ${user.name} ${user.surname}`);
    return user;
  }
}
