import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { EntityOwnership } from '../domain/entity-ownership.schema';
import { InjectModel } from '@nestjs/mongoose';
import { EntityOwnershipMapper } from '../mapper/entity-ownership.mapper';
import {
  EntityOwnershipDTO,
  EntityOwnershipInsertCapabiltyDTO,
  EntityOwnershipSearch,
  EntityOwnershipUserCheck,
  UserCapabilityDTO,
} from 'libs/users-common/src/lib/dto/entity-ownership-dto';
import { UserService } from './user.service';
import { exec } from 'child_process';

@Injectable()
export class EntityOwnershipService {
  constructor(
    @InjectModel(EntityOwnership.name) private model: Model<EntityOwnership>,
    private userService: UserService,
    private mapper: EntityOwnershipMapper
  ) {}

  async insert(eoDto: EntityOwnershipDTO): Promise<void> {
    const searchKeys: EntityOwnershipSearch = {
      entityGroup: eoDto.entityGroup,
      entityId: eoDto.entityId,
      entityName: eoDto.entityName,
    };
    let entity;
    const found = await this.findRaw(searchKeys);
    if (found.length > 0) {
      entity = found[0];
      this.mapper.toEntityEdit(entity, eoDto);
    } else {
      entity = this.mapper.toEntity(eoDto);
    }

    await entity.save();
  }
  public async insertUserCapability(oe: EntityOwnershipInsertCapabiltyDTO) {}
  public async checkUser(eouc: EntityOwnershipUserCheck): Promise<boolean> {
    const u = await this.findExisting(eouc);
    if (u) {
      const userFiltered = u.userCapabilities.find((a) => {
        return (
          a.userId == eouc.userId &&
          (eouc.capabilityName == null || eouc.capabilityName == a.capability)
        );
      });

      if (userFiltered) {
        return true;
      } else {
        const user = await this.userService.findById(eouc.userId);
        if (user.roles.includes('ADMIN')) {
          return true;
        } else {
          for (let index = 0; index < user.roles.length; index++) {
            const userRole = user.roles[index];
            const role = u.overriderRoles.includes(userRole);
            if (role) return true;
          }
        }
      }
    }
    return false;
  }
  private async findExisting(
    eouc: EntityOwnershipUserCheck
  ): Promise<EntityOwnershipDTO> {
    const entityOwnership = await this.model.findOne({
      entityGroup: eouc.entityGroup,
      entityId: eouc.entityId,
      entityName: eouc.entityName,
    });
    return this.mapper.toDto(entityOwnership);
  }

  public async find(sk: EntityOwnershipSearch): Promise<EntityOwnershipDTO[]> {
    return (await this.findRaw(sk)).map((a) => this.mapper.toDto(a));
  }

  private async findRaw(searchKeys: EntityOwnershipSearch) {
    return await this.model.find(searchKeys);
  }
}
