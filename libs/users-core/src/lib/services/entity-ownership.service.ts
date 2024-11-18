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
    console.info(
      'EO INSERT',
      eoDto.entityGroup,
      eoDto.entityId,
      eoDto.entityName
    );
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
  public async insertUserCapability(oe: EntityOwnershipInsertCapabiltyDTO) {
    const hasRoleAlready = await this.findInsertedUserCapability(oe);
    const searchKeys: EntityOwnershipSearch = {
      entityGroup: oe.entityGroup,
      entityId: oe.entityId,
      entityName: oe.entityName,
    };
    if (hasRoleAlready?.userId) {
      if (hasRoleAlready.capability != oe.capability) {
        const updateExistOne = await this.model.updateOne(
          { ...searchKeys, 'userCapabilities.userId': oe.userId },
          {
            $set: {
              'userCapabilities.$[related].capability': oe.capability,
            },
          },
          { arrayFilters: [{ 'related.userId': oe.userId }] }
        );
        if (updateExistOne.modifiedCount == 0) {
          console.warn(
            'Zaten var olan kullanıcının capabilitysi güncellenecekti ama kaydedilen yok gibi'
          );
        }
      }
    } else {
      const found = await this.findRaw(searchKeys);
      if (found.length > 0) {
        const entity = found[0];
        entity.userCapabilities.push({
          capability: oe.capability,
          userId: oe.userId,
        });
        await entity.save();
      }
    }
    // console.info('EO INS UC', oe.entityGroup, oe.entityId, oe.entityName);

    // let entity;
  }

  public async checkUser(
    eouc: EntityOwnershipUserCheck
  ): Promise<UserCapabilityDTO | null> {
    console.info('EO CHK', eouc.entityGroup, eouc.entityId, eouc.entityName);
    const existCapability = await this.findInsertedUserCapability(eouc);
    if (existCapability) {
      return existCapability;
    }
    const u = await this.findExisting(eouc);
    if (u) {
      const user = await this.userService.findById(eouc.userId);
      if (user.roles.includes('ADMIN')) {
        return {
          userId: user._id,
          capability: eouc.capability.toString(),
        };
      } else {
        for (let index = 0; index < user.roles.length; index++) {
          const userRole = user.roles[index];
          const role = u.overriderRoles.includes(userRole);
          if (role)
            return {
              userId: user._id,
              capability: eouc.capability?.toString(),
            };
        }
      }
    }
    return null;
  }

  private async findInsertedUserCapability(
    eouc: EntityOwnershipUserCheck
  ): Promise<UserCapabilityDTO> {
    // console.info({ cap: eouc.capability });
    const cap = await this.model
      .aggregate([
        {
          $match: {
            entityName: eouc.entityName,
            entityGroup: eouc.entityGroup,
            entityId: eouc.entityId,
            'userCapabilities.userId': eouc.userId,
            ...(eouc.capability ? { capability: eouc.capability } : {}),
          },
        },

        {
          $unwind: '$userCapabilities',
        },
        {
          $match: {
            'userCapabilities.userId': eouc.userId,
          },
        },

        {
          $project: {
            'userCapabilities.userId': 1,
            'userCapabilities.capability': 1,
            _id: 0,
          },
        },
      ])
      .exec();
    console.info(cap);
    const found = cap[0]?.['userCapabilities'];

    if (found) {
      return {
        capability: found.capability,
        userId: found.userId,
      };
    } else return null;
  }

  private async findExisting(
    eouc: EntityOwnershipUserCheck
  ): Promise<EntityOwnershipDTO> {
    const entityOwnership = await this.model.findOne({
      entityGroup: eouc.entityGroup,
      entityId: eouc.entityId,
      entityName: eouc.entityName,
    });
    return entityOwnership ? this.mapper.toDto(entityOwnership) : null;
  }

  public async search(
    sk: EntityOwnershipSearch
  ): Promise<EntityOwnershipDTO[]> {
    return (await this.findRaw(sk)).map((a) => this.mapper.toDto(a));
  }

  public async deleteOwnership(sk: EntityOwnershipSearch) {
    await this.model.deleteOne({
      entityGroup: sk.entityGroup,
      entityId: sk.entityId,
      entityName: sk.entityName,
    });
  }

  private async findRaw(searchKeys: EntityOwnershipSearch) {
    return await this.model.find(searchKeys);
  }
}
