// src/elements/elements.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Element, ElementDocument } from '../schemas/elements.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';
import { CreateElementDto } from './dto/create-element.dto';

// interface ElementNode {
//   _id: Types.ObjectId;
//   name: string;
//   description?: string;
//   projectId: Types.ObjectId;
//   parentElementId?: Types.ObjectId;
//   order: number;
//   createdAt: Date;
//   updatedAt: Date;
//   children: ElementNode[]; // ← Recursivo
// }

@Injectable()
export class ElementsService {
  private readonly logger = new Logger(ElementsService.name);

  constructor(
    @InjectModel(Element.name) private elementModel: Model<ElementDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  /**
   * Crear un nuevo elemento
   */
  async create(createElementDto: CreateElementDto, userId: string) {
    const project = await this.projectModel.findById(
      createElementDto.projectId,
    );

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const canEdit =
      project.ownerId.toString() === userId ||
      project.permissions.some(
        (p) =>
          p.userId.toString() === userId &&
          (p.role === 'editor' || p.role === 'owner'),
      );

    if (!canEdit) {
      throw new ForbiddenException(
        'No tienes permiso para agregar elementos a este proyecto',
      );
    }

    // 3. Si hay parentElementId, verificar que existe y pertenece al mismo proyecto
    if (createElementDto.parentElementId) {
      const parentElement = await this.elementModel.findById(
        createElementDto.parentElementId,
      );

      if (!parentElement) {
        throw new NotFoundException('Elemento padre no encontrado');
      }

      if (parentElement.projectId.toString() !== createElementDto.projectId) {
        throw new ForbiddenException(
          'El elemento padre debe pertenecer al mismo proyecto',
        );
      }
    }

    // 4. Obtener el siguiente número de orden
    const maxOrderElement = await this.elementModel
      .findOne({
        projectId: new Types.ObjectId(createElementDto.projectId),
        parentElementId: createElementDto.parentElementId || null,
      })
      .sort({ order: -1 })
      .exec();

    const nextOrder = maxOrderElement ? (maxOrderElement.order || 0) + 1 : 0;

    // 5. Crear el elemento
    const element = new this.elementModel({
      name: createElementDto.name,
      description: createElementDto.description,
      projectId: new Types.ObjectId(createElementDto.projectId),
      parentElementId: createElementDto.parentElementId
        ? new Types.ObjectId(createElementDto.parentElementId)
        : null,
      order: nextOrder,
    });

    await element.save();

    this.logger.log(
      `✅ Elemento creado: "${element.name}" en proyecto: ${createElementDto.projectId}`,
    );

    return element;
  }

  /**
   * Obtener todos los elementos de un proyecto
   */
  async findByProject(projectId: string) {
    return this.elementModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Obtener solo elementos raíz (sin padre)
   */
  async findRootElements(projectId: string) {
    return this.elementModel
      .find({
        projectId: new Types.ObjectId(projectId),
        parentElementId: null,
      })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Obtener sub-elementos de un elemento
   */
  async findChildren(elementId: string) {
    return this.elementModel
      .find({ parentElementId: new Types.ObjectId(elementId) })
      .sort({ order: 1 })
      .exec();
  }

  /**
   * Obtener jerarquía completa de elementos
   */
  async findHierarchy(projectId: string): Promise<any[]> {
    const allElements = await this.elementModel
      .find({ projectId: new Types.ObjectId(projectId) })
      .sort({ order: 1 })
      .lean()
      .exec();

    // Construir árbol jerárquico
    const elementMap = new Map<string, any>();
    const rootElements: any[] = [];

    // Primera pasada: crear mapa
    allElements.forEach((element) => {
      elementMap.set(element._id.toString(), { ...element, children: [] });
    });

    // Segunda pasada: construir jerarquía
    allElements.forEach((element) => {
      const node = elementMap.get(element._id.toString());

      if (element.parentElementId) {
        const parent = elementMap.get(element.parentElementId.toString());
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootElements.push(node);
      }
    });

    return rootElements;
  }

  /**
   * Actualizar elemento
   */
  async update(elementId: string, updates: Partial<Element>) {
    const element = await this.elementModel.findByIdAndUpdate(
      elementId,
      { $set: updates },
      { new: true },
    );

    if (!element) {
      throw new NotFoundException('Elemento no encontrado');
    }

    this.logger.log(`✅ Elemento actualizado: "${element.name}"`);
    return element;
  }

  /**
   * Eliminar elemento
   */
  async delete(elementId: string, userId: string) {
    const element = await this.elementModel.findById(elementId);

    if (!element) {
      throw new NotFoundException('Elemento no encontrado');
    }

    // Verificar permisos en el proyecto
    const project = await this.projectModel.findById(element.projectId);

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    const canEdit =
      project.ownerId.toString() === userId ||
      project.permissions.some(
        (p) =>
          p.userId.toString() === userId &&
          (p.role === 'editor' || p.role === 'owner'),
      );

    if (!canEdit) {
      throw new ForbiddenException(
        'No tienes permiso para eliminar este elemento',
      );
    }

    // Eliminar también los sub-elementos
    await this.elementModel.deleteMany({ parentElementId: elementId });

    await this.elementModel.findByIdAndDelete(elementId);

    this.logger.log(`🗑️ Elemento eliminado: "${element.name}"`);

    return { success: true, message: 'Elemento eliminado' };
  }

  /**
   * Reordenar elementos
   */
  async reorder(elementIds: string[]) {
    const updatePromises = elementIds.map((elementId, index) =>
      this.elementModel.findByIdAndUpdate(elementId, { order: index }),
    );

    await Promise.all(updatePromises);

    this.logger.log(`🔄 ${elementIds.length} elementos reordenados`);

    return { success: true, message: 'Elementos reordenados' };
  }
}
