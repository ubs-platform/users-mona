import { Controller } from '@nestjs/common';
import { EntityOwnershipService } from '../services/entity-ownership.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import {
  EntityOwnershipDTO,
  EntityOwnershipInsertCapabiltyDTO,
  EntityOwnershipSearch,
  EntityOwnershipUserCheck,
} from 'libs/users-common/src/lib/dto/entity-ownership-dto';

@Controller('entity-ownership')
export class EntityOwnershipController {
  constructor(private eoService: EntityOwnershipService) {}

  @EventPattern('insert-ownership')
  async insertOwnership(oe: EntityOwnershipDTO) {
    console.info(oe);

    await this.eoService.insert(oe);
  }

  @EventPattern('insert-user-capability')
  async insertUserCapability(oe: EntityOwnershipInsertCapabiltyDTO) {
    console.info(oe);

    await this.eoService.insertUserCapability(oe);
  }
  @MessagePattern('check-ownership')
  async hasOwnership(eo: EntityOwnershipUserCheck) {
    return await this.eoService.checkUser(eo);
  }

  @MessagePattern('search-ownership')
  async searchOwnership(eo: EntityOwnershipSearch) {
    return await this.eoService.search(eo);
  }

  @EventPattern('delete-ownership')
  async deleteOwnership(eo: EntityOwnershipSearch) {
    await this.eoService.deleteOwnership(eo);
  }
}
