import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type FolderDocument = Folder & Document;

@Schema({ timestamps: true })
export class Folder {
  @Prop({ required: true })
  name: string;

  @Prop({ default: '' })
  description: string;

  @Prop({ default: '📁' })
  icon: string;

  @Prop({ default: '#6366f1' })
  color: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Folder', default: null })
  parentId: Types.ObjectId | null; // Para carpetas anidadas

  @Prop({ default: 0 })
  order: number; // Para ordenar carpetas

  @Prop({ type: [{ type: Types.ObjectId, ref: 'Project' }], default: [] })
  projectIds: Types.ObjectId[]; // Proyectos dentro de esta carpeta

  @Prop({ default: false })
  isArchived: boolean;
}

export const FolderSchema = SchemaFactory.createForClass(Folder);

// Índices para mejorar performance
FolderSchema.index({ ownerId: 1 });
FolderSchema.index({ parentId: 1 });
FolderSchema.index({ ownerId: 1, parentId: 1 });