import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface GroupMember {
  userId: Types.ObjectId;
  addedAt: Date;
  addedBy: Types.ObjectId;
}

export type GroupDocument = Group & Document;

@Schema({ timestamps: true })
export class Group {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: [Object], default: [] })
  members: GroupMember[];

  @Prop({ default: 0 })
  memberCount: number;
}

export const GroupSchema = SchemaFactory.createForClass(Group);

// Índices
GroupSchema.index({ ownerId: 1 });
GroupSchema.index({ 'members.userId': 1 });
GroupSchema.index({ name: 'text' });    