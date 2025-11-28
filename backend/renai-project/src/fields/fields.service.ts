import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Field, FieldDocument, FieldType } from '../schemas/field.schema';
import { Project, ProjectDocument } from '../schemas/project.schema';

@Injectable()
export class FieldsService {
  constructor(
    @InjectModel(Field.name) private fieldModel: Model<FieldDocument>,
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
  ) {}

  async list() {
    return this.fieldModel.find({}).sort({ order: 1, createdAt: 1 }).exec();
  }

  async getById(id: string) {
    const field = await this.fieldModel.findById(id).exec();
    if (!field) throw new NotFoundException('Campo no encontrado');
    return field;
  }

  async getByKey(key: string) {
    const field = await this.fieldModel.findOne({ key: key.toLowerCase().trim() }).exec();
    if (!field) throw new NotFoundException('Campo no encontrado');
    return field;
  }

  async create(input: {
    name: string;
    key: string;
    type: FieldType;
    required?: boolean;
    order?: number;
    options?: string[];
    defaultValue?: any;
    validations?: {
      min?: number;
      max?: number;
      minLength?: number;
      maxLength?: number;
      regex?: string;
    };
    description?: string;
  }) {
    // Normalizar key
    const key = input.key.trim().toLowerCase();
    const exists = await this.fieldModel.exists({ key });
    if (exists) throw new BadRequestException('La clave del campo ya existe');

    // Validaciones básicas para opciones por tipo
    if (
      (input.type === FieldType.SELECT || input.type === FieldType.MULTISELECT) &&
      (!input.options || input.options.length === 0)
    ) {
      throw new BadRequestException('Las opciones son requeridas para select/multiselect');
    }

    const order = input.order ?? (await this.fieldModel.countDocuments().exec());

    const field = new this.fieldModel({ ...input, key, order });
    await field.save();
    return field;
  }

  async update(id: string, updates: Partial<Field>) {
    if (updates.key) {
      updates.key = updates.key.trim().toLowerCase();
      const exists = await this.fieldModel.exists({ key: updates.key, _id: { $ne: id } });
      if (exists) throw new BadRequestException('La clave del campo ya existe');
    }

    if (
      updates.type &&
      (updates.type === FieldType.SELECT || updates.type === FieldType.MULTISELECT) &&
      updates.options &&
      updates.options.length === 0
    ) {
      throw new BadRequestException('Las opciones son requeridas para select/multiselect');
    }

    const field = await this.fieldModel
      .findByIdAndUpdate(id, { $set: updates }, { new: true })
      .exec();

    if (!field) throw new NotFoundException('Campo no encontrado');
    return field;
  }

  async delete(id: string) {
    const deleted = await this.fieldModel.findByIdAndDelete(id).exec();
    if (!deleted) throw new NotFoundException('Campo no encontrado');
    // Limpieza EAV: remover referencias en proyectos
    await this.projectModel.updateMany(
      { 'customFields.field': new Types.ObjectId(id) },
      { $pull: { customFields: { field: new Types.ObjectId(id) } } },
    );
    return { success: true };
  }

  async reorder(idsInOrder: string[]) {
    // Asignar order incremental siguiendo el array
    const bulk = idsInOrder.map((id, idx) => ({
      updateOne: {
        filter: { _id: new Types.ObjectId(id) },
        update: { $set: { order: idx } },
      },
    }));
    if (bulk.length) await this.fieldModel.bulkWrite(bulk);
    return this.list();
  }

  // ============ VALIDACIÓN DINÁMICA ============
  // values: [{ field: ObjectId, value }]
  async validateValues(values: Array<{ field: string | Types.ObjectId; value: any }>) {
    const defs = await this.fieldModel.find({ active: true }).exec();
    const defMap = new Map<string, FieldDocument>();
    for (const d of defs) defMap.set(d._id.toString(), d);

    const provided = new Map<string, any>();
    for (const v of values) {
      const id = v.field.toString();
      provided.set(id, v.value);
    }

    // Verificar requeridos
    const missingRequired: string[] = [];
    for (const def of defs) {
      if (!def.required) continue;
      if (!provided.has(def._id.toString())) {
        missingRequired.push(def.key);
      } else {
        const val = provided.get(def._id.toString());
        if (val === null || val === undefined || val === '') missingRequired.push(def.key);
      }
    }
    if (missingRequired.length)
      throw new BadRequestException(
        `Faltan campos requeridos: ${missingRequired.join(', ')}`,
      );

    // Validar tipos y restricciones
    for (const item of values) {
      const def = defMap.get(item.field.toString());
      if (!def) throw new BadRequestException('Campo inválido');
      const value = item.value;

      if (value === undefined || value === null) continue; // permitido si no requerido

      switch (def.type) {
        case FieldType.TEXT:
        case FieldType.TEXTAREA: {
          if (typeof value !== 'string') {
            throw new BadRequestException(`El campo ${def.key} debe ser texto`);
          }
          const len = value.length;
          if (def.validations?.minLength && len < def.validations.minLength)
            throw new BadRequestException(
              `El campo ${def.key} debe tener al menos ${def.validations.minLength} caracteres`,
            );
          if (def.validations?.maxLength && len > def.validations.maxLength)
            throw new BadRequestException(
              `El campo ${def.key} debe tener máximo ${def.validations.maxLength} caracteres`,
            );
          if (def.validations?.regex) {
            const re = new RegExp(def.validations.regex);
            if (!re.test(value))
              throw new BadRequestException(`El campo ${def.key} no cumple el patrón requerido`);
          }
          break;
        }
        case FieldType.NUMBER: {
          if (typeof value !== 'number')
            throw new BadRequestException(`El campo ${def.key} debe ser numérico`);
          if (def.validations?.min !== undefined && value < def.validations.min)
            throw new BadRequestException(`El campo ${def.key} debe ser >= ${def.validations.min}`);
          if (def.validations?.max !== undefined && value > def.validations.max)
            throw new BadRequestException(`El campo ${def.key} debe ser <= ${def.validations.max}`);
          break;
        }
        case FieldType.BOOLEAN: {
          if (typeof value !== 'boolean')
            throw new BadRequestException(`El campo ${def.key} debe ser booleano`);
          break;
        }
        case FieldType.DATE: {
          const d = new Date(value);
          if (isNaN(d.getTime()))
            throw new BadRequestException(`El campo ${def.key} debe ser una fecha válida`);
          break;
        }
        case FieldType.SELECT: {
          if (!def.options?.length) break;
          if (typeof value !== 'string')
            throw new BadRequestException(`El campo ${def.key} debe ser texto`);
          if (!def.options.includes(value))
            throw new BadRequestException(`Valor inválido para ${def.key}`);
          break;
        }
        case FieldType.MULTISELECT: {
          if (!Array.isArray(value))
            throw new BadRequestException(`El campo ${def.key} debe ser un arreglo`);
          for (const v of value) {
            if (typeof v !== 'string' || !def.options?.includes(v))
              throw new BadRequestException(`Valor inválido para ${def.key}`);
          }
          break;
        }
        default:
          break;
      }
    }

    // Retornar normalizado: asegurar Types.ObjectId
    return values.map((v) => ({ field: new Types.ObjectId(v.field), value: v.value }));
  }
}
