import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument } from '../schemas/project.schema';
import * as crypto from 'crypto';
import { FieldsService } from '../fields/fields.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    private fieldsService: FieldsService,
  ) {}

  async create(
    name: string,
    ownerId: string,
    description?: string,
    coverImage?: string,
    fromTemplate: boolean = false,
  ) {
    const project = new this.projectModel({
      name: name.trim(),
      description: description?.trim(),
      coverImage,
      ownerId: new Types.ObjectId(ownerId),
      fromTemplate,
    });

    await project.save();
    console.log('✅ Proyecto creado:', project.name, 'por usuario:', ownerId);
    return project;
  }

  /**
   * Obtener todos los proyectos de un usuario
   */
  async findUserProjects(userId: string) {
    return this.projectModel
      .find({
        $or: [
          { ownerId: new Types.ObjectId(userId) },
          { 'permissions.userId': new Types.ObjectId(userId) },
        ],
      })
      .sort({ updatedAt: -1 })
      .populate('ownerId', 'name email picture')
      .exec();
  }

  /**
   * Obtener un proyecto por ID
   */
  async findOne(projectId: string, userId?: string) {
    const project = await this.projectModel
      .findById(projectId)
      .populate('ownerId', 'name email picture')
      .exec();

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Incrementar contador de vistas si no es el propietario
    if (userId && project.ownerId.toString() !== userId) {
      project.viewsCount += 1;
      project.lastAccessedAt = new Date();
      await project.save();
    }

    return project;
  }

  /**
   * Obtener proyecto por slug público
   */
  async findBySlug(slug: string) {
    const project = await this.projectModel
      .findOne({ publicSlug: slug })
      .populate('ownerId', 'name email picture')
      .exec();

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    return project;
  }

  /**
   * Actualizar proyecto
   */
  async update(projectId: string, updates: Partial<Project>) {
    const project = await this.projectModel.findByIdAndUpdate(
      projectId,
      { $set: updates },
      { new: true, runValidators: true },
    );

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    console.log('✅ Proyecto actualizado:', project.name);
    return project;
  }

  /**
   * Actualizar detalles seleccionados
   */
  async updateSelectedDetails(projectId: string, selectedDetails: any[]) {
    return this.update(projectId, { selectedDetails });
  }

  /**
   * Actualizar valores de campos personalizados con validación dinámica
   */
  async updateCustomFields(
    projectId: string,
    values: Array<{ field: string | Types.ObjectId; value: any }>,
  ) {
    // Valida contra definiciones activas de campos
    const normalized = await this.fieldsService.validateValues(values);

    const project = await this.projectModel
      .findByIdAndUpdate(
        projectId,
        { $set: { customFields: normalized } },
        { new: true },
      )
      .populate('customFields.field')
      .exec();

    if (!project) throw new NotFoundException('Proyecto no encontrado');
    return project;
  }

  async validateCustomFields(
    values: Array<{ field: string | Types.ObjectId; value: any }>,
  ) {
    // Reutiliza la validación y devuelve normalizados si ok
    return this.fieldsService.validateValues(values);
  }

  async getFieldsWithValues(projectId: string) {
    const project = await this.projectModel
      .findById(projectId)
      .populate('customFields.field')
      .exec();

    if (!project) throw new NotFoundException('Proyecto no encontrado');

    // 1. Obtener definiciones activas
    const defs = await this.fieldsService.list();

    // 2. Crear mapa de valores existentes
    const valueMap = new Map<string, any>();
    for (const cv of project.customFields || []) {
      valueMap.set(cv.field.toString(), cv.value);
    }

    // 3. Combinar definiciones con valores
    const result = defs.map((def) => ({
      _id: def._id,
      name: def.name,
      key: def.key,
      type: def.type,
      required: def.required,
      order: def.order,
      options: def.options,
      defaultValue: def.defaultValue,
      validations: def.validations,
      description: def.description,

      // Valor actual del proyecto si existe, sino el defaultValue
      value: valueMap.has(def._id.toString())
        ? valueMap.get(def._id.toString())
        : (def.defaultValue ?? null),
    }));

    return result;
  }

  /**
   * Eliminar proyecto
   */
  async delete(projectId: string, userId: string) {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Verificar que el usuario es el propietario
    if (project.ownerId.toString() !== userId) {
      throw new BadRequestException(
        'Solo el propietario puede eliminar el proyecto',
      );
    }

    await this.projectModel.findByIdAndDelete(projectId);
    console.log('🗑️ Proyecto eliminado:', project.name);
    return { success: true, message: 'Proyecto eliminado' };
  }

  /**
   * Generar slug público único
   */
  async generatePublicSlug(projectId: string): Promise<string> {
    const project = await this.findOne(projectId);

    // Si ya tiene slug, devolverlo
    if (project.publicSlug) {
      return project.publicSlug;
    }

    // Generar slug único
    let slug: string | null = null;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      // Generar slug aleatorio de 8 caracteres
      slug = crypto.randomBytes(4).toString('hex');

      // Verificar si ya existe
      const existing = await this.projectModel.findOne({ publicSlug: slug });
      if (!existing) {
        isUnique = true;
        project.publicSlug = slug;
        await project.save();
      }
      attempts++;
    }

    if (!isUnique || !slug) {
      throw new BadRequestException('No se pudo generar un slug único');
    }

    return slug;
  }
}
