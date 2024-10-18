import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientKafka, ClientRMQ } from '@nestjs/microservices';
import {
  EntityOwnershipDTO,
  EntityOwnershipInsertCapabiltyDTO,
  EntityOwnershipSearch,
  EntityOwnershipUserCheck,
  UserCapabilityDTO,
} from '@ubs-platform/users-common';
import { Observable } from 'rxjs';

@Injectable()
export class EntityOwnershipService implements OnModuleInit {
  constructor(
    @Inject('USER_MICROSERVICE')
    private userClient: ClientProxy | ClientKafka | ClientRMQ,
    @Inject('KAFKA_CLIENT')
    private kafkaClient: ClientProxy | ClientKafka | ClientRMQ
  ) {}

  onModuleInit() {
    // (this.userClient as ClientKafka).subscribeToResponseOf?.('user-by-id');
  }

  async insertOwnership(oe: EntityOwnershipDTO) {
    this.kafkaClient.emit('insert-ownership', oe);
  }

  async insertUserCapability(oe: EntityOwnershipInsertCapabiltyDTO) {
    this.kafkaClient.emit('insert-user-capability', oe);
  }

  hasOwnership(eo: EntityOwnershipUserCheck): Observable<UserCapabilityDTO> {
    return this.userClient.send('check-ownership', eo);
  }

  searchOwnership(eo: EntityOwnershipSearch): Observable<EntityOwnershipDTO[]> {
    return this.userClient.send('search-ownership', eo);
  }

  async deleteOwnership(oe: EntityOwnershipSearch) {
    this.kafkaClient.emit('delete-ownership', oe);
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
