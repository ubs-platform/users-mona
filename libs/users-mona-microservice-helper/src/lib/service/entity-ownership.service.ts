import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientKafka, ClientRMQ } from '@nestjs/microservices';
import {
  EntityOwnershipDTO,
  EntityOwnershipInsertCapabiltyDTO,
  EntityOwnershipUserCheck,
} from '@ubs-platform/users-common';

@Injectable()
export class EntityOwnershipService implements OnModuleInit {
  constructor(
    @Inject('USER_MICROSERVICE')
    private userClient: ClientProxy | ClientKafka | ClientRMQ
  ) {}

  onModuleInit() {
    // (this.userClient as ClientKafka).subscribeToResponseOf?.('user-by-id');
  }

  async insertOwnership(oe: EntityOwnershipDTO) {
    this.userClient.emit('insert-ownership', oe);
  }

  async insertUserCapability(oe: EntityOwnershipInsertCapabiltyDTO) {
    this.userClient.emit('insert-user-capability', oe);
  }

  async hasOwnership(eo: EntityOwnershipUserCheck) {
    return await this.userClient.emit('check-ownership', eo);
  }

  // async findUserAuth(userId: any): Promise<UserDTO> {
  //   console.debug('Fetching user');
  //   const user = (await firstValueFrom(
  //     this.userClient.send('user-by-id', userId)
  //   )) as UserDTO;
  //   console.debug(`The request made by: ${user.name} ${user.surname}`);
  //   return user;
  // }
}
