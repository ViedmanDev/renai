// src/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

/**
 * Marca un endpoint como público (sin autenticación requerida)
 * Uso: @Public()
 */
export const Public = () => SetMetadata('isPublic', true);
