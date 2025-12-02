import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Task, TaskDocument, TaskStatus, TaskPriority } from '../schemas/task.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task.name) private taskModel: Model<TaskDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  /**
   * Verificar que el usuario tenga acceso al proyecto
   */
  private async verifyProjectAccess(projectId: string, userId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const hasAccess =
      project.ownerId.toString() === userId ||
      project.permissions.some((p) => p.userId.toString() === userId);

    if (!hasAccess) {
      throw new ForbiddenException('No tienes acceso a este proyecto');
    }

    return project;
  }

  /**
   * Crear tarea
   */
  async create(
    projectId: string,
    userId: string,
    data: {
      title: string;
      description?: string;
      status?: TaskStatus;
      priority?: TaskPriority;
      assignedTo?: string;
      dueDate?: Date;
      tags?: string[];
    },
  ) {
    await this.verifyProjectAccess(projectId, userId);

    // Obtener el siguiente número de orden
    const maxOrderTask = await this.taskModel
      .findOne({ projectId: new Types.ObjectId(projectId) })
      .sort({ order: -1 })
      .exec();

    const nextOrder = maxOrderTask ? (maxOrderTask.order || 0) + 1 : 0;

    const task = new this.taskModel({
      title: data.title,
      description: data.description,
      status: data.status || TaskStatus.TODO,
      priority: data.priority || TaskPriority.MEDIUM,
      projectId: new Types.ObjectId(projectId),
      createdBy: new Types.ObjectId(userId),
      assignedTo: data.assignedTo ? new Types.ObjectId(data.assignedTo) : undefined,
      dueDate: data.dueDate,
      tags: data.tags || [],
      order: nextOrder,
    });

    await task.save();
    console.log('✅ Tarea creada:', task.title);

    return task;
  }

  /**
   * Listar tareas de un proyecto
   */
  async findByProject(projectId: string, userId: string) {
    await this.verifyProjectAccess(projectId, userId);

    const tasks = await this.taskModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .populate('createdBy', 'name email picture')
      .populate('assignedTo', 'name email picture')
      .sort({ order: 1, createdAt: -1 })
      .exec();

    return tasks;
  }

  /**
   * Obtener una tarea por ID
   */
  async findOne(taskId: string, userId: string) {
    const task = await this.taskModel
      .findById(taskId)
      .populate('createdBy', 'name email picture')
      .populate('assignedTo', 'name email picture')
      .exec();

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    await this.verifyProjectAccess(task.projectId.toString(), userId);

    return task;
  }

  /**
   * Actualizar tarea
   */
  async update(taskId: string, userId: string, updates: Partial<Task>) {
    const task = await this.taskModel.findById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    await this.verifyProjectAccess(task.projectId.toString(), userId);

    Object.assign(task, updates);
    await task.save();

    console.log('✅ Tarea actualizada:', task.title);
    return task;
  }

  /**
   * Eliminar tarea
   */
  async delete(taskId: string, userId: string) {
    const task = await this.taskModel.findById(taskId);

    if (!task) {
      throw new NotFoundException('Tarea no encontrada');
    }

    await this.verifyProjectAccess(task.projectId.toString(), userId);

    await this.taskModel.findByIdAndDelete(taskId);
    console.log('🗑️ Tarea eliminada:', task.title);

    return { success: true, message: 'Tarea eliminada' };
  }

  /**
   * Reordenar tareas
   */
  async reorder(projectId: string, userId: string, taskIds: string[]) {
    await this.verifyProjectAccess(projectId, userId);

    const updatePromises = taskIds.map(async (taskId, index) => {
      const task = await this.taskModel.findOne({
        _id: taskId,
        projectId: new Types.ObjectId(projectId),
      });

      if (task) {
        task.order = index;
        await task.save();
        return task;
      }
      return null;
    });

    const results = await Promise.all(updatePromises);
    const updatedCount = results.filter((r) => r !== null).length;

    console.log(`✅ ${updatedCount} tareas reordenadas`);

    return {
      success: true,
      message: `${updatedCount} tareas reordenadas`,
      updatedCount,
    };
  }

  /**
   * Cambiar estado de tarea
   */
  async changeStatus(taskId: string, userId: string, status: TaskStatus) {
    return this.update(taskId, userId, { status });
  }

  /**
   * Asignar tarea a usuario
   */
  async assignTask(taskId: string, userId: string, assignedToId: string) {
    return this.update(taskId, userId, {
      assignedTo: new Types.ObjectId(assignedToId),
    });
  }

  /**
   * Obtener estadísticas de tareas
   */
  async getStats(projectId: string, userId: string) {
    await this.verifyProjectAccess(projectId, userId);

    const tasks = await this.taskModel.find({
      projectId: new Types.ObjectId(projectId),
    });

    const stats = {
      total: tasks.length,
      todo: tasks.filter((t) => t.status === TaskStatus.TODO).length,
      inProgress: tasks.filter((t) => t.status === TaskStatus.IN_PROGRESS).length,
      done: tasks.filter((t) => t.status === TaskStatus.DONE).length,
      byPriority: {
        low: tasks.filter((t) => t.priority === TaskPriority.LOW).length,
        medium: tasks.filter((t) => t.priority === TaskPriority.MEDIUM).length,
        high: tasks.filter((t) => t.priority === TaskPriority.HIGH).length,
      },
    };

    return stats;
  }
}