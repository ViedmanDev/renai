import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Project, ProjectDocument, ProjectRole } from '../schemas/project.schema';

@Injectable()
export class ProjectPermissionGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<ProjectRole>(
      'project-permission',
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?._id || request.user?.id;
    const projectId = request.params.id;

    if (!userId) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    if (!projectId) {
      throw new ForbiddenException('ID de proyecto no proporcionado');
    }

    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const hasPermission = project.hasPermission(userId.toString(), requiredPermission);

    if (!hasPermission) {
      throw new ForbiddenException(
        `No tienes permiso de ${requiredPermission} en este proyecto`,
      );
    }

    request.project = project;

    return true;
  }
}