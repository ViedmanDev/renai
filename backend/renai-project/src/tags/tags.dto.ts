/**
 * DTOs: Tag (Etiqueta)
 * Backend NestJS
 *
 * Data Transfer Objects para validación de datos
 * Ubicación: Backend/src/tags/dto/tag.dto.ts
 */

import { IsString, IsNotEmpty, Matches, MaxLength } from 'class-validator';

export class CreateTagDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la etiqueta es requerido' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El color de la etiqueta es requerido' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe estar en formato hexadecimal (#RRGGBB)',
  })
  color: string;
}

export class UpdateTagDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre de la etiqueta es requerido' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'El color de la etiqueta es requerido' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, {
    message: 'El color debe estar en formato hexadecimal (#RRGGBB)',
  })
  color: string;
}
