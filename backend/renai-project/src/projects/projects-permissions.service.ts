import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  Project,
  ProjectDocument,
  ProjectRole,
  ProjectVisibility,
} from '../schemas/project.schema';
import { User } from '../schemas/user.schema';
import { Group, GroupDocument } from '../schemas/group.schema';

@Injectable()
export class ProjectsPermissionsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Group.name) private groupModel: Model<GroupDocument>,
  ) {}

  async canAccess(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectModel.findById(projectId);

    if (!project) return false;

    if (project.ownerId.toString() === userId) {
      return true;
    }

    if (project.visibility === ProjectVisibility.PUBLIC) {
      return true;
    }

    const hasPermission = project.permissions.some(
      (p) => p.userId.toString() === userId,
    );

    if (hasPermission) {
      return true;
    }
    // ✅ Verificar permisos por grupo
    const userGroups = await this.getUserGroups(userId);

    if (userGroups.length > 0) {
      const hasGroupPermission = project.groupPermissions.some((gp) =>
        userGroups.some((ug) => ug._id.toString() === gp.groupId.toString()),
      );

      if (hasGroupPermission) {
        return true;
      }
    }

    return false;
  }


  async canEdit(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectModel.findById(projectId);

    if (!project) return false;

    if (project.ownerId.toString() === userId) {
      return true;
    }

    const permission = project.permissions.find(
      (p) => p.userId.toString() === userId,
    );

    if (permission?.role === ProjectRole.EDITOR) {
      return true;
    }
    const userGroups = await this.getUserGroups(userId);

    if (userGroups.length > 0) {
      const hasEditorGroupPermission = project.groupPermissions.some(
        (gp) =>
          gp.role === ProjectRole.EDITOR &&
          userGroups.some((ug) => ug._id.toString() === gp.groupId.toString()),
      );

      if (hasEditorGroupPermission) {
        return true;
      }
    }

    return false;
  }

  async isOwner(projectId: string, userId: string): Promise<boolean> {
    const project = await this.projectModel.findById(projectId);
    if (!project) return false;
    return project.ownerId.toString() === userId;
  }

  async getUserRole(
    projectId: string,
    userId: string,
  ): Promise<ProjectRole | null> {
    const project = await this.projectModel.findById(projectId);

    if (!project) return null;

    if (project.ownerId.toString() === userId) {
      return ProjectRole.OWNER;
    }

    const permission = project.permissions.find(
      (p) => p.userId.toString() === userId,
    );

    return permission?.role || null;
  }

  async requireAccess(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const hasAccess = await this.canAccess(projectId, userId);

    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return project;
  }

  async requireEdit(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const canEdit = await this.canEdit(projectId, userId);

    if (!canEdit) {
      throw new ForbiddenException(
        'No tienes permiso para editar este proyecto',
      );
    }

    return project;
  }

  async requireOwner(projectId: string, userId: string): Promise<Project> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const isOwner = await this.isOwner(projectId, userId);

    if (!isOwner) {
      throw new ForbiddenException(
        'Solo el propietario puede realizar esta acción',
      );
    }

    return project;
  }

  async grantPermission(
    projectId: string,
    ownerId: string,
    email: string,
    role: ProjectRole,
  ) {
    await this.requireOwner(projectId, ownerId);

    const targetUser = await this.userModel.findOne({
      email: email.toLowerCase().trim()
    });

    if (!targetUser) {
      throw new BadRequestException('Usuario no encontrado con ese email');
    }

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (targetUser._id.toString() === ownerId) {
      throw new BadRequestException('No puedes otorgarte permisos a ti mismo');
    }

    const existingIndex = project.permissions.findIndex(
      (p) => p.userId.toString() === targetUser._id.toString(),
    );

    if (existingIndex >= 0) {
      // Actualizar rol existente
      project.permissions[existingIndex].role = role;
      console.log( `Rol actualizado: ${email} → ${role}`);
    } else {
      // Agregar nuevo permiso
      project.permissions.push({
        userId: targetUser._id,
        email: email.toLowerCase().trim(),
        role,
        grantedAt: new Date(),
        grantedBy: new Types.ObjectId(ownerId),
      });
      console.log( `Permiso otorgado: ${email} → ${role}`);
    }

    // Marcar como modificado explícitamente
    project.markModified('permissions');
    const savedProject = await project.save();

    console.log(`💾 Proyecto guardado. Total permisos: ${savedProject.permissions.length}`);

    return savedProject;
  }

  //Actualizar rol sin revocar
  async updatePermissionRole(
    projectId: string,
    ownerId: string,
    targetUserId: string,
    newRole: ProjectRole,
  ) {
    await this.requireOwner(projectId, ownerId);

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const permissionIndex = project.permissions.findIndex(
      (p) => p.userId.toString() === targetUserId,
    );

    if (permissionIndex === -1) {
      throw new BadRequestException(
        'El usuario no tiene permisos en este proyecto',
      );
    }

    // Actualizar solo el rol
    project.permissions[permissionIndex].role = newRole;

    // Marcar como modificado
    project.markModified('permissions');
    const savedProject = await project.save();

    console.log(`✏️ Rol actualizado para ${targetUserId}: ${newRole}`);
    console.log(`💾 Total permisos: ${savedProject.permissions.length}`);

    return savedProject;
  }

  async revokePermission(
    projectId: string,
    ownerId: string,
    targetUserId: string,
  ) {
    await this.requireOwner(projectId, ownerId);

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const initialCount = project.permissions.length;

    project.permissions = project.permissions.filter(
      (p) => p.userId.toString() !== targetUserId,
    );

    if (project.permissions.length === initialCount) {
      throw new BadRequestException(
        'El usuario no tiene permisos en este proyecto',
      );
    }

    // Marcar como modificado
    project.markModified('permissions');
    const savedProject = await project.save();

    console.log(`🚫 Permiso revocado para usuario: ${targetUserId}`);
    console.log(`💾 Total permisos restantes: ${savedProject.permissions.length}`);

    return savedProject;
  }

  async changeVisibility(
    projectId: string,
    ownerId: string,
    visibility: ProjectVisibility,
  ) {
    await this.requireOwner(projectId, ownerId);

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    project.visibility = visibility;

    await project.save();
    console.log(`🔒 Visibilidad cambiada: ${visibility}`);
    return project;
  }

  async getProjectUsers(projectId: string, requesterId: string) {
    await this.requireAccess(projectId, requesterId);

    const project = await this.projectModel
      .findById(projectId)
      .populate('ownerId', 'name email picture')
      .exec();

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const populatedPermissions = await Promise.all(
      project.permissions.map(async (perm) => {
        const user = await this.userModel
          .findById(perm.userId.toString())
          .select('name email picture');

        return {
          userId: perm.userId,
          email: perm.email,
          role: perm.role,
          grantedAt: perm.grantedAt,
          user: user
            ? {
                name: user.name,
                email: user.email,
                picture: user.picture,
              }
            : null,
        };
      }),
    );

    return {
      owner: project.ownerId,
      collaborators: populatedPermissions,
      visibility: project.visibility,
    };
  }

  async grantGroupPermission(
    projectId: string,
    ownerId: string,
    groupId: string,
    role: ProjectRole,
  ) {
    await this.requireOwner(projectId, ownerId);

    const group = await this.groupModel.findById(groupId);
    if (!group) {
      throw new BadRequestException('Grupo no encontrado');
    }

    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const existingIndex = project.groupPermissions.findIndex(
      (p) => p.groupId.toString() === groupId,
    );

    if (existingIndex >= 0) {
      project.groupPermissions[existingIndex].role = role;
      console.log(`✅ Rol de grupo actualizado: ${group.name} → ${role}`);
    } else {
      project.groupPermissions.push({
        groupId: new Types.ObjectId(groupId),
        role,
        grantedAt: new Date(),
        grantedBy: new Types.ObjectId(ownerId),
      });
      console.log(`✅ Permiso otorgado a grupo: ${group.name} → ${role}`);
    }

    project.markModified('groupPermissions');
    const savedProject = await project.save();

    console.log(`💾 Total permisos de grupo: ${savedProject.groupPermissions.length}`);
    return savedProject;
  }

  // ✅ NUEVO: Revocar permiso de un grupo
  async revokeGroupPermission(
    projectId: string,
    ownerId: string,
    groupId: string,
  ) {
    await this.requireOwner(projectId, ownerId);

    const project = await this.projectModel.findById(projectId);
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const initialCount = project.groupPermissions.length;

    project.groupPermissions = project.groupPermissions.filter(
      (p) => p.groupId.toString() !== groupId,
    );

    if (project.groupPermissions.length === initialCount) {
      throw new BadRequestException(
        'El grupo no tiene permisos en este proyecto',
      );
    }

    project.markModified('groupPermissions');
    const savedProject = await project.save();

    console.log(`🚫 Permiso de grupo revocado: ${groupId}`);
    console.log(`💾 Total permisos de grupo restantes: ${savedProject.groupPermissions.length}`);

    return savedProject;
  }

  // ✅ NUEVO: Obtener grupos con acceso al proyecto
  async getProjectGroups(projectId: string, requesterId: string) {
    await this.requireAccess(projectId, requesterId);

    const project = await this.projectModel.findById(projectId).exec();
    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const populatedGroups = await Promise.all(
      project.groupPermissions.map(async (perm) => {
        const group = await this.groupModel.findById(perm.groupId);

        return {
          groupId: perm.groupId,
          role: perm.role,
          grantedAt: perm.grantedAt,
          group: group
            ? {
                name: group.name,
                description: group.description,
                memberCount: group.memberCount,
              }
            : null,
        };
      }),
    );

    return {
      groups: populatedGroups,
    };
  }

  // ✅ NUEVO: Obtener grupos del usuario
  async getUserGroups(userId: string) {
    // Grupos donde es owner
    const ownedGroups = await this.groupModel
      .find({ ownerId: new Types.ObjectId(userId) })
      .exec();

    // Grupos donde es miembro
    const memberGroups = await this.groupModel
      .find({ 'members.userId': new Types.ObjectId(userId) })
      .exec();

    return [...ownedGroups, ...memberGroups];
  }
}