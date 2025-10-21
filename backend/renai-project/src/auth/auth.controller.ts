import {
  Controller,
  Post,
  Body,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    try {
      if (!body.email || !body.password) {
        throw new HttpException(
          'Email y contraseña son obligatorios',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.authService.login(body.email, body.password);
    } catch (error) {
      console.error('Error en /auth/login:', error.message);
      throw error;
    }
  }

  @Post('register')
  async register(@Body() body: { email: string; password: string }) {
    try {
      if (!body.email || !body.password) {
        throw new HttpException(
          'Email y contraseña son obligatorios',
          HttpStatus.BAD_REQUEST,
        );
      }

      return await this.authService.register(body.email, body.password);
    } catch (error) {
      console.error('Error en /auth/register:', error.message);
      throw error;
    }
  }
}
