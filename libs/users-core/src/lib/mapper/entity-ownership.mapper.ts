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
      fileUploadAllowedFormats: entityOwnership.fileUploadAllowedFormats,
      fileUploadMaxLengthBytes: entityOwnership.fileUploadMaxLengthBytes,
      entityGroup: entityOwnership.entityGroup,
      entityId: entityOwnership.entityId,
      entityName: entityOwnership.entityName,
      overriderRoles: entityOwnership.overriderRoles,
    } as EntityOwnershipDTO;
  }

  toEntity(entityOwnership: EntityOwnershipDTO) {
    return new this.model({
      fileUploadAllowedFormats: entityOwnership.fileUploadAllowedFormats,
      fileUploadMaxLengthBytes: entityOwnership.fileUploadMaxLengthBytes,
      entityGroup: entityOwnership.entityGroup,
      entityId: entityOwnership.entityId,
      entityName: entityOwnership.entityName,
      capabilityName: entityOwnership.capabilityName,
      overriderRoles: entityOwnership.overriderRoles,
    });
  }

  toEntityEdit(
    existingEntity: EntityOwnership,
    entityOwnership: EntityOwnershipDTO
  ) {
    existingEntity.fileUploadAllowedFormats =
      entityOwnership.fileUploadAllowedFormats;
    existingEntity.fileUploadMaxLengthBytes =
      entityOwnership.fileUploadMaxLengthBytes;
    existingEntity.entityGroup = entityOwnership.entityGroup;
    existingEntity.entityId = entityOwnership.entityId;
    existingEntity.entityName = entityOwnership.entityName;
    existingEntity.capabilityName = entityOwnership.capabilityName;
    existingEntity.overriderRoles = entityOwnership.overriderRoles;
    return existingEntity;
  }
}
