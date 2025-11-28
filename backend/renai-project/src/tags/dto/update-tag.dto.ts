// src/tags/dto/update-tag.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateTagDto } from './create-tag.dto';
import { IsOptional, IsString, Matches } from 'class-validator';

export class UpdateTagDto extends PartialType(CreateTagDto) {
  @IsOptional()
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'El color debe ser una cadena de texto' })
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message:
      'El color debe ser un código hexadecimal válido (ej: #FF0000 o #f00)',
  })
  color?: string;
}
