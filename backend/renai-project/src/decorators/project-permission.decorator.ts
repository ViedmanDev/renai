import { SetMetadata } from '@nestjs/common';
import { ProjectRole } from '../schemas/project.schema';

export const RequireProjectPermission = (role: ProjectRole) =>
  SetMetadata('project-permission', role);