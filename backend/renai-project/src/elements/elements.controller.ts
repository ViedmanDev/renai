// src/elements/elements.controller.ts
import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ElementsService } from './elements.service';
import { CreateElementDto } from './dto/create-element.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserId } from '../decorators/user-id.decorator';
import { UpdateElementDto } from './dto/update-element.dto';

@Controller('elements')
@UseGuards(JwtAuthGuard)
export class ElementsController {
  constructor(private elementsService: ElementsService) {}

  /**
   * Crear nuevo elemento
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @UserId() userId: string,
    @Body() createElementDto: CreateElementDto,
  ) {
    return this.elementsService.create(createElementDto, userId);
  }

  /**
   * Obtener todos los elementos de un proyecto
   */
  @Get('project/:projectId')
  async findByProject(@Param('projectId') projectId: string) {
    return this.elementsService.findByProject(projectId);
  }

  /**
   * Obtener solo elementos raíz de un proyecto
   */
  @Get('project/:projectId/root')
  async findRootElements(@Param('projectId') projectId: string) {
    return this.elementsService.findRootElements(projectId);
  }

  /**
   * Obtener jerarquía completa de elementos
   */
  @Get('project/:projectId/hierarchy')
  async findHierarchy(@Param('projectId') projectId: string) {
    return this.elementsService.findHierarchy(projectId);
  }

  /**
   * Obtener sub-elementos de un elemento
   */
  @Get(':id/children')
  async findChildren(@Param('id') id: string) {
    return this.elementsService.findChildren(id);
  }

  /**
   * Actualizar elemento
   */
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updates: UpdateElementDto) {
    return this.elementsService.update(id, updates);
  }

  /**
   * Eliminar elemento
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @UserId() userId: string) {
    return this.elementsService.delete(id, userId);
  }

  /**
   * Reordenar elementos
   */
  @Patch('reorder')
  async reorder(@Body() body: { elementIds: string[] }) {
    return this.elementsService.reorder(body.elementIds);
  }
}
