// src/elements/elements.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ElementsController } from './elements.controller';
import { ElementsService } from './elements.service';
import { Element, ElementSchema } from '../schemas/elements.schema';
import { Project, ProjectSchema } from '../schemas/project.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Element.name, schema: ElementSchema },
      { name: Project.name, schema: ProjectSchema },
    ]),
  ],
  controllers: [ElementsController],
  providers: [ElementsService],
  exports: [ElementsService],
})
export class ElementsModule {}
