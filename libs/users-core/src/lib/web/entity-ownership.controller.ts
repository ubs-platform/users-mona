import { Controller } from '@nestjs/common';
import { EntityOwnershipService } from '../services/entity-ownership.service';
import { EventPattern, MessagePattern } from '@nestjs/microservices';
import {
  EntityOwnershipDTO,
  EntityOwnershipUserCheck,
} from 'libs/users-common/src/lib/dto/entity-ownership-dto';

@Controller('entity-ownership')
export class EntityOwnershipController {
  constructor(private eoService: EntityOwnershipService) {}

  @EventPattern('insert-ownership')
  async insertOwnership(oe: EntityOwnershipDTO) {
    await this.eoService.insert(oe);
  }
  @MessagePattern('check-ownership')
  async hasOwnership(eo: EntityOwnershipUserCheck) {
    return await this.eoService.checkUser(eo);
  }
}
