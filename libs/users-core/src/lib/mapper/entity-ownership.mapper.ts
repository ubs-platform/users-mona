import { EntityOwnership } from '../domain/entity-ownership.schema';
import { EntityOwnershipDTO } from '../../../../users-common/src/lib/dto/entity-ownership-dto';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
@Injectable()
export class EntityOwnershipMapper {
  constructor(
    @InjectModel(EntityOwnership.name) private model: Model<EntityOwnership>
  ) {}
  toDto(entityOwnership: EntityOwnership) {
    return {
      entityGroup: entityOwnership.entityGroup,
      entityId: entityOwnership.entityId,
      entityName: entityOwnership.entityName,
      overriderRoles: entityOwnership.overriderRoles,
      userCapabilities: entityOwnership.userCapabilities.map((a) => ({
        userId: a.userId,
        capability: a.capability,
      })),
    } as EntityOwnershipDTO;
  }

  toEntity(entityOwnership: EntityOwnershipDTO) {
    return new this.model({
      entityGroup: entityOwnership.entityGroup,
      entityId: entityOwnership.entityId,
      entityName: entityOwnership.entityName,
      overriderRoles: entityOwnership.overriderRoles,
      userCapabilities: entityOwnership.userCapabilities.map((a) => {
        return {
          userId: a.userId,
          capability: a.capability,
        };
      }),
    });
  }

  toEntityEdit(
    existingEntity: EntityOwnership,
    entityOwnership: EntityOwnershipDTO
  ) {
    // existingEntity.fileUploadAllowedFormats =
    //   entityOwnership.fileUploadAllowedFormats;
    // existingEntity.fileUploadMaxLengthBytes =
    //   entityOwnership.fileUploadMaxLengthBytes;
    // existingEntity.entityGroup = entityOwnership.entityGroup;
    // existingEntity.entityId = entityOwnership.entityId;
    // existingEntity.entityName = entityOwnership.entityName;
    // existingEntity.overriderRoles = entityOwnership.overriderRoles;
    existingEntity.userCapabilities = entityOwnership.userCapabilities;
    return existingEntity;
  }
}
