import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { randomUUID } from 'crypto';

@Schema()
export class PwResetRequest {
  @Prop({
    type: String,
    default: function genUUID() {
      return randomUUID();
    },
  })
  _id: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  expireAfter: Date;
}

export const PwResetRequestSchema =
  SchemaFactory.createForClass(PwResetRequest);
