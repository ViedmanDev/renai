// src/tags/tags.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tag, TagDocument } from '../schemas/tags.schema';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagsService {
  constructor(@InjectModel(Tag.name) private tagModel: Model<TagDocument>) {}

  async findAll(): Promise<Tag[]> {
    return this.tagModel.find().sort({ created_at: -1 }).exec();
  }

  async create(createTagDto: CreateTagDto): Promise<Tag> {
    const { name, color } = createTagDto;

    const existingTag = await this.tagModel
      .findOne({
        name: name.trim(),
      })
      .exec();

    if (existingTag) {
      throw new ConflictException('Ya existe una etiqueta con ese nombre');
    }

    const newTag = new this.tagModel({
      name: name.trim(),
      color,
      created_at: new Date(),
      updated_at: new Date(),
    });

    return newTag.save();
  }

  async update(id: string, updateTagDto: UpdateTagDto): Promise<Tag> {
    const { name, color } = updateTagDto;

    // Verificar si existe otra etiqueta con el mismo nombre
    if (name) {
      const existingTag = await this.tagModel
        .findOne({
          name: name.trim(),
          _id: { $ne: id },
        })
        .exec();

      if (existingTag) {
        throw new ConflictException('Ya existe otra etiqueta con ese nombre');
      }
    }

    const updateData: any = { updated_at: new Date() };

    if (name) updateData.name = name.trim();
    if (color) updateData.color = color;

    const updatedTag = await this.tagModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedTag) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    return updatedTag;
  }

  async remove(id: string): Promise<{ success: boolean; message: string }> {
    const result = await this.tagModel.findByIdAndDelete(id).exec();

    if (!result) {
      throw new NotFoundException('Etiqueta no encontrada');
    }

    return {
      success: true,
      message: 'Etiqueta eliminada correctamente',
    };
  }
}
