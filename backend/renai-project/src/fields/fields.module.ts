import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Field, FieldSchema } from '../schemas/field.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';
import { FieldsService } from './fields.service.js';
import { FieldsController } from './fields.controller.js';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Field.name, schema: FieldSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [FieldsController],
  providers: [FieldsService],
  exports: [FieldsService],
})
export class FieldsModule {}
