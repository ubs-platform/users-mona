import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { EntityOwnership } from '../domain/entity-ownership.schema';
import { InjectModel } from '@nestjs/mongoose';
import { EntityOwnershipMapper } from '../mapper/entity-ownership.mapper';
import {
  EntityOwnershipDTO,
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
    let parent: EntityOwnership | undefined;
    if (eoDto.parent) {
      parent = (await this.findRaw(eoDto.parent))[0];
    }

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
    if (parent) {
      entity.parentOwnershipId = parent._id;
      // entity.userCapabilities.push(...parent.userCapabilities);
    }

    await entity.save();
  }

  public async checkUser(eouc: EntityOwnershipUserCheck): Promise<boolean> {
    const u = await this.findExisting(eouc);
    if (u.length > 0) {
      const userFiltered = u.find((a) =>
        a.userCapabilities.find((a) => {
          return (
            a.userId == eouc.userId &&
            (eouc.capabilityName == null || eouc.capabilityName == a.capability)
          );
        })
      );

      if (userFiltered) {
        return true;
      } else {
        const user = await this.userService.findById(eouc.userId);
        if (user.roles.includes('ADMIN')) {
          return true;
        } else {
          const roleEx = u.find((existingOwnership) => {
            for (let index = 0; index < user.roles.length; index++) {
              const userRole = user.roles[index];
              const role = existingOwnership.overriderRoles.includes(userRole);
              if (role) return true;
            }
            return false;
          });

          if (roleEx) return true;
        }
      }
    }
    return false;
  }
  private async findExisting(eouc: EntityOwnershipUserCheck): Promise<EntityOwnershipDTO> {
    const entityOwnership =  await this.model.findOne({
      entityGroup: eouc.entityGroup,
      entityId: eouc.entityId,
      entityName: eouc.entityName,
    });
    let parentId :String, parentUserCapability : UserCapabilityDTO[] = [], parent: EntityOwnership;

    do {
      parentId = entityOwnership.parentOwnershipId
      parent = this.
    } while 
    

  }

  public async find(sk: EntityOwnershipSearch): Promise<EntityOwnershipDTO[]> {
    return (await this.findRaw(sk)).map((a) => this.mapper.toDto(a));
  }

  private async findRaw(searchKeys: EntityOwnershipSearch) {
    return await this.model.find(searchKeys);
  }
}
