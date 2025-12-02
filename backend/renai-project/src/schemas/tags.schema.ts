// src/tags/schemas/tag.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type TagDocument = Tag & Document;

@Schema({ timestamps: true })
export class Tag {
  @Prop({ required: true })
  name: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  color: string; // Color hexadecimal para la bandera/etiqueta

  @Prop({ default: true })
  isActive: boolean;

  @Prop({
    type: MongooseSchema.Types.ObjectId,
    ref: 'Project',
    required: false,
  })
  projectId: string; // Relación con el proyecto

  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User' })
  createdBy: string; // Usuario que creó la etiqueta
}

export const TagSchema = SchemaFactory.createForClass(Tag);
