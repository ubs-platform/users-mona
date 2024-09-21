import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientKafka, ClientRMQ } from '@nestjs/microservices';
import {
  EntityOwnershipDTO,
  EntityOwnershipInsertCapabiltyDTO,
  EntityOwnershipUserCheck,
  UserCapabilityDTO,
} from '@ubs-platform/users-common';
import { Observable } from 'rxjs';

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

  hasOwnership(eo: EntityOwnershipUserCheck): Observable<UserCapabilityDTO> {
    return this.userClient.send('check-ownership', eo);
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
