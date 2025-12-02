import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Folder, FolderDocument } from '../schemas/folder.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class FoldersService {
  constructor(
    @InjectModel(Folder.name) private folderModel: Model<FolderDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  // Crear carpeta
  async create(
    name: string,
    ownerId: string,
    parentId?: string,
    description?: string,
    icon?: string,
    color?: string,
  ) {
    // Validar que el padre existe (si se especifica)
    if (parentId) {
      const parent = await this.folderModel.findOne({
        _id: parentId,
        ownerId,
      });

      if (!parent) {
        throw new NotFoundException('Carpeta padre no encontrada');
      }
    }

    // Obtener el orden más alto
    const lastFolder = await this.folderModel
      .findOne({ ownerId, parentId: parentId || null })
      .sort({ order: -1 })
      .exec();

    const order = lastFolder ? lastFolder.order + 1 : 0;

    const folder = new this.folderModel({
      name,
      ownerId,
      parentId: parentId || null,
      description: description || '',
      icon: icon || '📁',
      color: color || '#6366f1',
      order,
    });

    await folder.save();

    console.log(' Carpeta creada:', folder.name);

    return folder;
  }

  // Obtener todas las carpetas del usuario
  async findUserFolders(userId: string) {
    const folders = await this.folderModel
      .find({ ownerId: userId, isArchived: false })
      .populate('projectIds')
      .sort({ order: 1 })
      .exec();

    return folders;
  }

  // Obtener carpeta por ID
  async findOne(folderId: string, userId: string) {
    const folder = await this.folderModel
      .findOne({ _id: folderId, ownerId: userId })
      .populate('projectIds')
      .exec();

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada');
    }

    return folder;
  }

  // Actualizar carpeta
  async update(folderId: string, userId: string, updates: Partial<Folder>) {
    const folder = await this.folderModel.findOne({
      _id: folderId,
      ownerId: userId,
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada');
    }

    // No permitir cambiar el propietario
    delete updates['ownerId'];

    Object.assign(folder, updates);
    await folder.save();

    console.log(' Carpeta actualizada:', folder.name);

    return folder;
  }

  async getProjectsByFolder(userId: string, folderId: string | null) {
    const projects = await this.projectModel
      .find({
        ownerId: new Types.ObjectId(userId),
        folderId: folderId ? new Types.ObjectId(folderId) : null,
      })
      .sort({ updatedAt: -1 })
      .exec();

    console.log(`📁 Proyectos en carpeta ${folderId || 'root'}:`, projects.length);
    return projects;
  }

  // Eliminar carpeta
  async delete(folderId: string, userId: string) {
    const folder = await this.folderModel.findOne({
      _id: folderId,
      ownerId: userId,
    });

    if (!folder) {
      throw new NotFoundException('Carpeta no encontrada');
    }

    // Verificar si tiene proyectos
    if (folder.projectIds && folder.projectIds.length > 0) {
      throw new BadRequestException(
        'No puedes eliminar una carpeta que contiene proyectos. Muévelos primero.',
      );
    }

    // Verificar si tiene subcarpetas
    const subfolders = await this.folderModel.find({ parentId: folderId });
    if (subfolders.length > 0) {
      throw new BadRequestException(
        'No puedes eliminar una carpeta que contiene subcarpetas.',
      );
    }

    await this.folderModel.deleteOne({ _id: folderId });

    console.log('🗑️ Carpeta eliminada:', folder.name);

    return { success: true, message: 'Carpeta eliminada' };
  }

  // Mover proyecto a carpeta
  async moveProjectToFolder(
    projectId: string,
    folderId: string | null,
    userId: string,
  ) {
    // Verificar que el proyecto existe y pertenece al usuario
    const project = await this.projectModel.findOne({
      _id: projectId,
      ownerId: userId,
    });

    if (!project) {
      throw new NotFoundException('Proyecto no encontrado');
    }

    // Si hay un folderId, verificar que la carpeta existe
    if (folderId) {
      const folder = await this.folderModel.findOne({
        _id: folderId,
        ownerId: userId,
      });

      if (!folder) {
        throw new NotFoundException('Carpeta no encontrada');
      }

      // Remover de la carpeta anterior
      if (project.folderId) {
        await this.folderModel.updateOne(
          { _id: project.folderId },
          { $pull: { projectIds: project._id } },
        );
      }

      // Agregar a la nueva carpeta
      await this.folderModel.updateOne(
        { _id: folderId },
        { $addToSet: { projectIds: project._id } },
      );

      project.folderId = new Types.ObjectId(folderId);
    } else {
      // Mover a raíz (sin carpeta)
      if (project.folderId) {
        await this.folderModel.updateOne(
          { _id: project.folderId },
          { $pull: { projectIds: project._id } },
        );
      }

      project.folderId = null;
    }

    await project.save();

    console.log(' Proyecto movido:', project.name, '→', folderId || 'Raíz');

    return project;
  }

  // Obtener estructura jerárquica de carpetas
  async getFolderTree(userId: string) {
    const folders = await this.folderModel
      .find({ ownerId: userId, isArchived: false })
      .sort({ order: 1 })
      .exec();

    // Construir árbol jerárquico
    const buildTree = (parentId: string | null = null): any[] => {
      return folders
        .filter((f) =>
          parentId
            ? f.parentId?.toString() === parentId
            : !f.parentId,
        )
        .map((folder) => ({
          ...folder.toObject(),
          children: buildTree(folder._id.toString()),
        }));
    };

    return buildTree();
  }

  // Reordenar carpetas
  async reorder(userId: string, folderIds: string[]) {
    const updates = folderIds.map((id, index) =>
      this.folderModel.updateOne(
        { _id: id, ownerId: userId },
        { order: index },
      ),
    );

    await Promise.all(updates);

    console.log('🔄 Carpetas reordenadas');

    return { success: true };
  }
}