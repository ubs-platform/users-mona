import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class EmailChangeRequest {
  _id?: any;

  @Prop()
  userId: string;
  @Prop()
  newEmail: string;
  @Prop()
  code: string;
  @Prop()
  expireAfter: Date;
}

export type EmailChangeRequestDocument = EmailChangeRequest & Document;
export const EmailChangeRequestSchema =
  SchemaFactory.createForClass(EmailChangeRequest);
