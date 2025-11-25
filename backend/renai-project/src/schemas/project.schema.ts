import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ProjectDocument = Project & Document;

// Enum para niveles de visibilidad
export enum ProjectVisibility {
  PRIVATE = 'private', // Solo el propietario
  TEAM = 'team', // Solo usuarios invitados
  PUBLIC = 'public', // Cualquiera con el link
}

// Enum para roles de permisos
export enum ProjectRole {
  OWNER = 'owner', // Puede hacer todo
  EDITOR = 'editor', // Puede editar
  VIEWER = 'viewer', // Solo puede ver
}

// Interface para permisos de usuario
export interface ProjectPermission {
  userId: Types.ObjectId;
  email: string;
  role: ProjectRole;
  grantedAt: Date;
  grantedBy: Types.ObjectId;
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  coverImage?: string;

  // Propietario del proyecto
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  // Nivel de visibilidad
  @Prop({
    type: String,
    enum: Object.values(ProjectVisibility),
    default: ProjectVisibility.PRIVATE,
  })
  visibility: ProjectVisibility;

  // Permisos de usuarios
  @Prop({ type: [Object], default: [] })
  permissions: ProjectPermission[];

  // Slug público único (para compartir)
  @Prop({ unique: true, sparse: true })
  publicSlug?: string;

  // Detalles/campos del proyecto
  @Prop({ type: Array, default: [] })
  selectedDetails: any[];

  @Prop({ default: false })
  fromTemplate: boolean;

  // Metadata adicional
  @Prop({ default: 0 })
  viewsCount: number;

  @Prop()
  lastAccessedAt?: Date;

  //Project schema para incluir folderId
  @Prop({ type: Types.ObjectId, ref: 'Folder', default: null })
  folderId: Types.ObjectId | null;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Índices para mejorar búsquedas
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ 'permissions.userId': 1 });
ProjectSchema.index({ publicSlug: 1 });
ProjectSchema.index({ createdAt: -1 });
