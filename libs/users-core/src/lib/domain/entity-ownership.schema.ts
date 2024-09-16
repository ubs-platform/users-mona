import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export class UserCapability {
  userId: string;
  capability: string;
  // canEdit: boolean;
  // canRemove: boolean;
  // canView: boolean;
}

@Schema()
export class EntityOwnership {
  _id?: any;

  @Prop([UserCapability])
  userCapabilities: UserCapability[];

  @Prop()
  entityGroup: String;

  @Prop()
  entityName: String;

  @Prop()
  entityId: String;

  @Prop([String])
  overriderRoles: String[];

  @Prop(String)
  parentOwnershipId: String;
}

export type EntityOwnershipDocument = EntityOwnership & Document;
export const EntityOwnershipSchema =
  SchemaFactory.createForClass(EntityOwnership);
