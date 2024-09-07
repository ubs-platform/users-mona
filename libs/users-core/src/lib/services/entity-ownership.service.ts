import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { EntityOwnership } from '../domain/entity-ownership.schema';
import { InjectModel } from '@nestjs/mongoose';
import { EntityOwnershipMapper } from '../mapper/entity-ownership.mapper';
import {
  EntityOwnershipDTO,
  EntityOwnershipSearch,
  EntityOwnershipUserCheck,
} from 'libs/users-common/src/lib/dto/entity-ownership-dto';

@Injectable()
export class EntityOwnershipService {
  constructor(
    @InjectModel(EntityOwnership.name) private model: Model<EntityOwnership>,
    private mapper: EntityOwnershipMapper
  ) {}

  async insert(eoDto: EntityOwnershipDTO): Promise<void> {
    const searchKeys: EntityOwnershipSearch = {
      entityGroup: eoDto.entityGroup,
      entityId: eoDto.entityId,
      entityName: eoDto.entityName,
      capabilityName: eoDto.capabilityName,
    };

    const found = await this.findRaw(searchKeys);
    if (found.length > 0) {
      let foundSingle = found[0];
      this.mapper.toEntityEdit(foundSingle, eoDto);
      await foundSingle.save();
    }
    const newClasss = this.mapper.toEntity(eoDto);
    await newClasss.save();
  }
  public async checkUser(
    eouc: EntityOwnershipUserCheck
  ): Promise<EntityOwnershipDTO[]> {
    const u = await this.model.find({
      entityGroup: eouc.entityGroup,
      entityId: eouc.entityId,
      entityName: eouc.entityName,
      userIds: eouc.userId,
      capabilityName: eouc.capabilityName ?? undefined,
    });
    return u.map((a) => this.mapper.toDto(a));
  }
  public async find(sk: EntityOwnershipSearch): Promise<EntityOwnershipDTO[]> {
    return (await this.findRaw(sk)).map((a) => this.mapper.toDto(a));
  }

  private async findRaw(searchKeys: EntityOwnershipSearch) {
    return await this.model.find(searchKeys);
  }
}
