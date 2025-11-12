import {
  Controller,
  Post,
  Body,
  Get,
  Headers,
  UnauthorizedException,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import type { Response } from 'express';

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

  // Iniciar login con Google
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    // Redirige a Google
  }

  // Callback de Google
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthCallback(@Req() req, @Res() res: Response) {
    try {
      const result = await this.authService.googleLogin(req.user);
      
    // Redirigir al frontend con el token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      res.redirect(`${frontendUrl}/auth/google/success?token=${result.token}`);
    } catch (error) {
      console.error('Error en Google callback:', error);
      res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/login?error=google_auth_failed`);
    }
  }
  @Post('set-password')
  async setPassword(
    @Headers('authorization') auth: string,
    @Body() body: { password: string },
  ) {
    if (!auth || !auth.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token no proporcionado');
    }
    const token = auth.split(' ')[1];
    return this.authService.setPassword(token, body.password);
  }
}
