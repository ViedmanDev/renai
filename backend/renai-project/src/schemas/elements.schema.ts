// src/schemas/element.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export interface ElementDocument extends Document {
  name: string;
  description?: string;
  projectId: Types.ObjectId;
  parentElementId?: Types.ObjectId; // ← Corregido: era "parentItemId"
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

@Schema({ timestamps: true })
export class Element {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop({ type: Types.ObjectId, ref: 'Project', required: true })
  projectId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Element', default: null })
  parentElementId?: Types.ObjectId; // ← Corregido: era "parentelementId"

  @Prop({ default: 0 })
  order: number;
}

export const ElementSchema = SchemaFactory.createForClass(Element);

// Índices para mejorar performance
ElementSchema.index({ projectId: 1, order: 1 });
ElementSchema.index({ parentElementId: 1 }); // ← Corregido: era "parentElement"
