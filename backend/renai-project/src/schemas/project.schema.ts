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

export interface GroupPermission {
  groupId: Types.ObjectId;
  role: ProjectRole;
  grantedAt: Date;
  grantedBy: Types.ObjectId;
}

//  Document type con métodos
export interface ProjectDocument extends Document {
  name: string;
  description?: string;
  coverImage?: string;
  ownerId: Types.ObjectId;
  visibility: ProjectVisibility;
  permissions: ProjectPermission[];
  groupPermissions: GroupPermission[];
  publicSlug?: string;
  selectedDetails: any[];
  customFields: { field: Types.ObjectId; value: any }[];
  fromTemplate: boolean;
  viewsCount: number;
  lastAccessedAt?: Date;
  folderId: Types.ObjectId | null;
  order?: number;

  //Métodos helper
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

  @Prop({ type: [Object], default: [] })
  groupPermissions: GroupPermission[];

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

  @Prop({ type: Number, default: 0 })
  order?: number;
}

export const ProjectSchema = SchemaFactory.createForClass(Project);

// Índices
ProjectSchema.index({ ownerId: 1 });
ProjectSchema.index({ 'permissions.userId': 1 });
ProjectSchema.index({ 'groupPermissions.groupId': 1 });
ProjectSchema.index({ publicSlug: 1 });
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ 'customFields.field': 1 });
ProjectSchema.index({ ownerId: 1, order: 1 });
ProjectSchema.index({ folderId: 1, order: 1 });

// Métodos helper para permisos
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

//Método para verificar permisos por grupo
ProjectSchema.methods.hasGroupPermission = function (
  userId: string,
  userGroups: any[],
  requiredRole: ProjectRole = ProjectRole.VIEWER,
): boolean {
  if (!userGroups || userGroups.length === 0) {
    return false;
  }

  const roleHierarchy: Record<ProjectRole, number> = {
    [ProjectRole.VIEWER]: 1,
    [ProjectRole.EDITOR]: 2,
    [ProjectRole.OWNER]: 3,
  };

  // Buscar si el usuario pertenece a algún grupo con permisos
  for (const groupPerm of this.groupPermissions) {
    const userInGroup = userGroups.some(
      (g) => g._id.toString() === groupPerm.groupId.toString(),
    );

    if (userInGroup) {
      if (roleHierarchy[groupPerm.role] >= roleHierarchy[requiredRole]) {
        return true;
      }
    }
  }

  return false;
};

ProjectSchema.methods.canView = function (
  userId: string,
  userGroups?: any[],
): boolean {
  if (this.visibility === ProjectVisibility.PUBLIC) {
    return true;
  }

  // Verificar permisos individuales
  if (this.hasPermission(userId, ProjectRole.VIEWER)) {
    return true;
  }

  // Verificar permisos por grupo
  if (userGroups) {
    return this.hasGroupPermission(userId, userGroups, ProjectRole.VIEWER);
  }

  return false;
}
//canEdit considera grupos
ProjectSchema.methods.canEdit = function (
  userId: string,
  userGroups?: any[],
): boolean {
  // Verificar permisos individuales
  if (this.hasPermission(userId, ProjectRole.EDITOR)) {
    return true;
  }

  // Verificar permisos por grupo
  if (userGroups) {
    return this.hasGroupPermission(userId, userGroups, ProjectRole.EDITOR);
  }

  return false;
};

ProjectSchema.methods.isOwner = function (userId: string): boolean {
  return this.ownerId.toString() === userId;
};