import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { EntityOwnership } from '../domain/entity-ownership.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class EntityOwnershipService {
  constructor(
    @InjectModel(EntityOwnership.name) private model: Model<EntityOwnership>
  ) {}
}
