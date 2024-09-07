import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class EntityOwnership {
  _id?: any;

  @Prop([String])
  userIds: String[];

  @Prop()
  entityGroup: String;

  @Prop()
  entityName: String;

  @Prop()
  capabilityName: String;

  @Prop()
  entityId: String;

  @Prop()
  fileUploadMaxLengthBytes: String;

  @Prop([String])
  fileUploadAllowedFormats: String[];
  /*
	"userIds":["userId1","userId2", "userId3"],
	"entityGroup": "lotus-question-book",
	"entityName": "thumbnail",
	"entityId": "questionBookId",
	"fileUploadMaxLengthBytes": 23123123213,
	"fileUploadAllowedFormats":
  */
  // @Prop()
  // newEmail: string;
  // @Prop()
  // code: string;
  // @Prop()
  // expireAfter: Date;
}

export type EntityOwnershipDocument = EntityOwnership & Document;
export const EntityOwnershipSchema =
  SchemaFactory.createForClass(EntityOwnership);
