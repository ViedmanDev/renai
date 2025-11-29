import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { ProjectsPermissionsService } from './projects-permissions.service';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { FieldsModule } from '../fields/fields.module';
import { User, UserSchema } from '../schemas/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Project.name, schema: ProjectSchema },
      { name: User.name, schema: UserSchema },
    ]),
    FieldsModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService, ProjectsPermissionsService],
  exports: [ProjectsService, ProjectsPermissionsService],
})
export class ProjectsModule {}
