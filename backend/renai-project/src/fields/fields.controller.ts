import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { FieldsService } from './fields.service';
import { FieldType } from '../schemas/field.schema';

@Controller('fields')
export class FieldsController {
  constructor(private fieldsService: FieldsService) {}

  @Get()
  async list() {
    return this.fieldsService.list();
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.fieldsService.getById(id);
  }

  @Get('key/:key')
  async getByKey(@Param('key') key: string) {
    return this.fieldsService.getByKey(key);
  }

  @Post()
  async create(
    @Body()
    body: {
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
    },
  ) {
    return this.fieldsService.create(body);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updates: any) {
    const field = await this.fieldsService.update(id, updates);
    return { success: true, field };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    const result = await this.fieldsService.delete(id);
    return { success: true };
  }

  @Patch('reorder/bulk')
  async reorder(@Body() body: { ids: string[] }) {
    return this.fieldsService.reorder(body.ids);
  }
}