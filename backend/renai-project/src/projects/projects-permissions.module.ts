import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsPermissionsService } from './projects-permissions.service';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: Project.name, schema: ProjectSchema },
    ])
  ],
  providers: [ProjectsPermissionsService],
  exports: [ProjectsPermissionsService],
})
export class ProjectsPermissionsModule {}