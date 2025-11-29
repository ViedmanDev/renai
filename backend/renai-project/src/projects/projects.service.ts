import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Project, ProjectDocument, ProjectRole, ProjectPermission } from '../schemas/project.schema';
import { User, UserDocument } from '../schemas/user.schema';
import * as crypto from 'crypto';
import { FieldsService } from '../fields/fields.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private fieldsService: FieldsService,
  ) {}

  async create(
    name: string,
    ownerId: string,
    description?: string,
    coverImage?: string,
    fromTemplate: boolean = false,
    visibility?: string,
    folderId?: string,
  ) {
    const project = new this.projectModel({
      name: name.trim(),
      description: description?.trim(),
      coverImage,
      ownerId: new Types.ObjectId(ownerId),
      fromTemplate,
      visibility: visibility || 'private',
      folderId: folderId ? new Types.ObjectId(folderId) : null,
    });

    await project.save();
    console.log('✅ Proyecto creado:', project.name, 'por usuario:', ownerId);
    console.log('📁 En carpeta:', folderId || 'Sin carpeta');
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
    return this.fieldsService.validateValues(values);
  }

  async getFieldsWithValues(projectId: string) {
    const project = await this.projectModel
      .findById(projectId)
      .populate('customFields.field')
      .exec();

    if (!project) throw new NotFoundException('Proyecto no encontrado');

    const defs = await this.fieldsService.list();

    const valueMap = new Map<string, any>();
    for (const cv of project.customFields || []) {
      valueMap.set(cv.field.toString(), cv.value);
    }

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

    if (project.publicSlug) {
      return project.publicSlug;
    }

    let slug: string | null = null;
    let isUnique = false;
    let attempts = 0;

    while (!isUnique && attempts < 5) {
      slug = crypto.randomBytes(4).toString('hex');

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

  /**
   * Agregar colaborador a un proyecto
   */
  async addCollaborator(
    projectId: string,
    email: string,
    role: ProjectRole,
    grantedBy: string,
  ): Promise<Project> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.ownerId.toString() !== grantedBy) {
      throw new ForbiddenException('Solo el propietario puede agregar colaboradores');
    }

    const user = await this.userModel.findOne({ email });

    if (!user) {
      throw new NotFoundException(`Usuario con email ${email} no encontrado`);
    }

    if (user._id.toString() === project.ownerId.toString()) {
      throw new ForbiddenException('El propietario ya tiene todos los permisos');
    }

    const existingPermission = project.permissions.find(
      (p) => p.userId.toString() === user._id.toString(),
    );

    if (existingPermission) {
      existingPermission.role = role;
      existingPermission.grantedAt = new Date();
    } else {
      const newPermission: ProjectPermission = {
        userId: user._id,
        email: user.email,
        role,
        grantedAt: new Date(),
        grantedBy: new Types.ObjectId(grantedBy),
      };

      project.permissions.push(newPermission);
    }

    await project.save();
    console.log(`Colaborador ${email} agregado con rol ${role}`);

    return project;
  }

  /**
   * Remover colaborador de un proyecto
   */
  async removeCollaborator(
    projectId: string,
    userIdToRemove: string,
    requestingUserId: string,
  ): Promise<Project> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.ownerId.toString() !== requestingUserId) {
      throw new ForbiddenException('Solo el propietario puede remover colaboradores');
    }

    if (userIdToRemove === project.ownerId.toString()) {
      throw new ForbiddenException('No puedes remover al propietario');
    }

    const initialLength = project.permissions.length;
    project.permissions = project.permissions.filter(
      (p) => p.userId.toString() !== userIdToRemove,
    );

    if (project.permissions.length === initialLength) {
      throw new NotFoundException('El usuario no tiene permisos en este proyecto');
    }

    await project.save();
    console.log(`Colaborador ${userIdToRemove} removido`);

    return project;
  }

  /**
   * Actualizar rol de colaborador
   */
  async updateCollaboratorRole(
    projectId: string,
    userId: string,
    newRole: ProjectRole,
    requestingUserId: string,
  ): Promise<Project> {
    const project = await this.projectModel.findById(projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.ownerId.toString() !== requestingUserId) {
      throw new ForbiddenException('Solo el propietario puede cambiar roles');
    }

    const permission = project.permissions.find(
      (p) => p.userId.toString() === userId,
    );

    if (!permission) {
      throw new NotFoundException('El usuario no tiene permisos en este proyecto');
    }

    permission.role = newRole;
    permission.grantedAt = new Date();

    await project.save();
    console.log(`✅ Rol de ${userId} actualizado a ${newRole}`);

    return project;
  }

  /**
   * Obtener lista de colaboradores
   */
  async getCollaborators(projectId: string): Promise<any[]> {
    const project = await this.projectModel
      .findById(projectId)
      .populate('ownerId', 'name email picture');

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const owner = {
      userId: project.ownerId,
      role: ProjectRole.OWNER,
      grantedAt: project['createdAt'],
      isOwner: true,
    };

    const collaborators = await Promise.all(
      project.permissions.map(async (perm) => {
        const user = await this.userModel.findById(perm.userId).select('name email picture');
        return {
          userId: perm.userId,
          name: user?.name,
          email: user?.email || perm.email,
          picture: user?.picture,
          role: perm.role,
          grantedAt: perm.grantedAt,
          isOwner: false,
        };
      }),
    );

    return [owner, ...collaborators];
  }

  /**
   * Obtener proyecto público por slug
   */
  async getByPublicSlug(slug: string): Promise<Project> {
    const project = await this.projectModel.findOne({ publicSlug: slug });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    if (project.visibility !== 'public') {
      throw new ForbiddenException('Este proyecto no es público');
    }

    project.viewsCount += 1;
    project.lastAccessedAt = new Date();
    await project.save();

    return project;
  }
}