import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types, Schema as MongooseSchema } from 'mongoose';

// Enum para niveles de visibilidad
export enum ProjectVisibility {
  PRIVATE = 'private',
  TEAM = 'team',
  PUBLIC = 'public',
}

// Enum para roles de permisos
export enum ProjectRole {
  OWNER = 'owner',
  EDITOR = 'editor',
  VIEWER = 'viewer',
}

// Interface para permisos de usuario
export interface ProjectPermission {
  userId: Types.ObjectId;
  email: string;
  role: ProjectRole;
  grantedAt: Date;
  grantedBy: Types.ObjectId;
}

// ✅ Document type con métodos
export interface ProjectDocument extends Document {
  name: string;
  description?: string;
  coverImage?: string;
  ownerId: Types.ObjectId;
  visibility: ProjectVisibility;
  permissions: ProjectPermission[];
  publicSlug?: string;
  selectedDetails: any[];
  customFields: { field: Types.ObjectId; value: any }[];
  fromTemplate: boolean;
  viewsCount: number;
  lastAccessedAt?: Date;
  folderId: Types.ObjectId | null;
  
  // Métodos helper
  hasPermission(userId: string, requiredRole?: ProjectRole): boolean;
  getUserRole(userId: string): ProjectRole | null;
  canView(userId: string): boolean;
  canEdit(userId: string): boolean;
  isOwner(userId: string): boolean;
}

@Schema({ timestamps: true })
export class Project {
  @Prop({ required: true })
  name: string;

  @Prop()
  description?: string;

  @Prop()
  coverImage?: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  ownerId: Types.ObjectId;

  @Prop({
    type: String,
    enum: Object.values(ProjectVisibility),
    default: ProjectVisibility.PRIVATE,
  })
  visibility: ProjectVisibility;

  @Prop({ type: [Object], default: [] })
  permissions: ProjectPermission[];

  @Prop({ unique: true, sparse: true })
  publicSlug?: string;

  @Prop({ type: Array, default: [] })
  selectedDetails: any[];

  @Prop({
    type: [
      {
        field: { type: Types.ObjectId, ref: 'Field', required: true },
        value: { type: MongooseSchema.Types.Mixed },
      },
    ],
    default: [],
  })
  customFields: { field: Types.ObjectId; value: any }[];

  @Prop({ default: false })
  fromTemplate: boolean;

  @Prop({ default: 0 })
  viewsCount: number;

  @Prop()
  lastAccessedAt?: Date;

  @Prop({ type: Types.ObjectId, ref: 'Folder', default: null })
  folderId: Types.ObjectId | null;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Índices
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ 'permissions.userId': 1 });
ProjectSchema.index({ publicSlug: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ 'customFields.field': 1 });

// ✅ Métodos helper para permisos
ProjectSchema.methods.hasPermission = function (
  userId: string,
  requiredRole: ProjectRole = ProjectRole.VIEWER,
): boolean {
  if (this.ownerId.toString() === userId) {
    return true;
  }

  const permission = this.permissions.find(
    (p: ProjectPermission) => p.userId.toString() === userId,
  );

  if (!permission) {
    return false;
  }

  const roleHierarchy: Record<ProjectRole, number> = {
    [ProjectRole.VIEWER]: 1,
    [ProjectRole.EDITOR]: 2,
    [ProjectRole.OWNER]: 3,
  };

  return roleHierarchy[permission.role] >= roleHierarchy[requiredRole];
};

ProjectSchema.methods.getUserRole = function (userId: string): ProjectRole | null {
  if (this.ownerId.toString() === userId) {
    return ProjectRole.OWNER;
  }

  const permission = this.permissions.find(
    (p: ProjectPermission) => p.userId.toString() === userId,
  );

  return permission ? permission.role : null;
};

ProjectSchema.methods.canView = function (userId: string): boolean {
  if (this.visibility === ProjectVisibility.PUBLIC) {
    return true;
  }

  return this.hasPermission(userId, ProjectRole.VIEWER);
};

ProjectSchema.methods.canEdit = function (userId: string): boolean {
  return this.hasPermission(userId, ProjectRole.EDITOR);
};

ProjectSchema.methods.isOwner = function (userId: string): boolean {
  return this.ownerId.toString() === userId;
};