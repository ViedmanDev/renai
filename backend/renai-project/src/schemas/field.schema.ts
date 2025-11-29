import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type FieldDocument = Field & Document;

export enum FieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  BOOLEAN = 'boolean',
  DATE = 'date',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
}

@Schema({ _id: false })
export class FieldValidations {
  @Prop()
  min?: number;

  @Prop()
  max?: number;

  @Prop()
  minLength?: number;

  @Prop()
  maxLength?: number;

  @Prop()
  regex?: string;
}

const FieldValidationsSchema = SchemaFactory.createForClass(FieldValidations);

@Schema({ timestamps: true })
export class Field {
  @Prop({ required: true })
  name: string;

  // Clave única para referenciar el campo en payloads
  @Prop({ required: true, unique: true, trim: true, lowercase: true })
  key: string;

  @Prop({ type: String, enum: Object.values(FieldType), required: true })
  type: FieldType;

  @Prop({ default: false })
  required: boolean;

  @Prop({ default: 0 })
  order: number;

  // Opciones para select/multiselect
  @Prop({ type: [String], default: [] })
  options?: string[];

  // Valor por defecto
  @Prop({ type: Object })
  defaultValue?: any;

  @Prop({ type: FieldValidationsSchema, default: {} })
  validations?: FieldValidations;

  @Prop({ default: true })
  active: boolean;

  @Prop()
  description?: string;
}

export const FieldSchema = SchemaFactory.createForClass(Field);

FieldSchema.index({ key: 1 }, { unique: true });
FieldSchema.index({ order: 1 });
