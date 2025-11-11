import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    console.log('=== CONTROLLER LOGIN ===');
    console.log('Body completo:', body);
    console.log('Email:', body.email);
    console.log('Password:', body.password);
    console.log('Password tipo:', typeof body.password);
    console.log('Password undefined?:', body.password === undefined);
    console.log('=======================');
    return this.authService.login(body.email, body.password);
  }

  @Post('register')
  async register(@Body() body: { name: string; email: string; password: string }) {
    return this.authService.register(body.name, body.email, body.password);
  }

  @Get('verify')
  async verify(@Headers('authorization') auth: string) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }

    const token = auth.split(' ')[1];
    return this.authService.verifyToken(token);
  }
}