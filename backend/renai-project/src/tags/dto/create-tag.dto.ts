import { IsNotEmpty, IsString, IsOptional, Matches } from 'class-validator';

export class CreateTagDto {
  @IsNotEmpty({ message: 'El nombre de la etiqueta es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  name: string;

  @IsNotEmpty({ message: 'El color es requerido' })
  @IsString({ message: 'El color debe ser una cadena de texto' })
  @Matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, {
    message:
      'El color debe ser un código hexadecimal válido (ej: #FF0000 o #f00)',
  })
  color: string;
}
