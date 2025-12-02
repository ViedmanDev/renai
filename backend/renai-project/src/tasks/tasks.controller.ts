import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TaskStatus, TaskPriority } from '../schemas/task.schema';
import * as jwt from 'jsonwebtoken';

@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  private getUserIdFromToken(authHeader: string): string {
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'SECRET_KEY',
    ) as { id: string; email: string };

    return decoded.id;
  }

  /**
   * Crear tarea en un proyecto
   */
  @Post('project/:projectId')
  async create(
    @Param('projectId') projectId: string,
    @Headers('authorization') auth: string,
    @Body()
    body: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string;
      dueDate?: Date;
      tags?: string[];
    },
  ) {
    console.log(`📬 POST /tasks/project/${projectId}`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.create(projectId, userId, body);
  }

  /**
   * Listar tareas de un proyecto
   */
  @Get('project/:projectId')
  async findByProject(
    @Param('projectId') projectId: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 GET /tasks/project/${projectId}`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.findByProject(projectId, userId);
  }

  /**
   * Obtener estadísticas de tareas
   */
  @Get('project/:projectId/stats')
  async getStats(
    @Param('projectId') projectId: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 GET /tasks/project/${projectId}/stats`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.getStats(projectId, userId);
  }

  /**
   * Reordenar tareas
   */
  @Patch('project/:projectId/reorder')
  async reorder(
    @Param('projectId') projectId: string,
    @Headers('authorization') auth: string,
    @Body() body: { taskIds: string[] },
  ) {
    console.log(`📬 PATCH /tasks/project/${projectId}/reorder`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.reorder(projectId, userId, body.taskIds);
  }

  /**
   * Obtener una tarea específica
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 GET /tasks/${id}`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.findOne(id, userId);
  }

  /**
   * Actualizar tarea
   */
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() updates: any,
  ) {
    console.log(`📬 PATCH /tasks/${id}`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.update(id, userId, updates);
  }

  /**
   * Eliminar tarea
   */
  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
  ) {
    console.log(`📬 DELETE /tasks/${id}`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.delete(id, userId);
  }

  /**
   * Cambiar estado de tarea
   */
  @Patch(':id/status')
  async changeStatus(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { status: TaskStatus },
  ) {
    console.log(`📬 PATCH /tasks/${id}/status`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.changeStatus(id, userId, body.status);
  }

  /**
   * Asignar tarea
   */
  @Patch(':id/assign')
  async assignTask(
    @Param('id') id: string,
    @Headers('authorization') auth: string,
    @Body() body: { assignedTo: string },
  ) {
    console.log(`📬 PATCH /tasks/${id}/assign`);
    const userId = this.getUserIdFromToken(auth);
    return this.tasksService.assignTask(id, userId, body.assignedTo);
  }
}