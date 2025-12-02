import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { UsersService } from './users.service';

class CreateUserDto {
  name: string;
  email: string;
  password: string;
}

class ResendDto {
  email: string;
}

@Controller('auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  /*
  @Post('register')
  async register(@Body() body: CreateUserDto) {
    const { name, email, password } = body;
    return this.usersService.createUser(name, email, password);
  }
  */
  @Post('resend-verification')
  async resend(@Body() body: ResendDto) {
    return this.usersService.resendVerification(body.email);
  }

  @Get('verify-email')
  async verify(@Query('token') token: string) {
    return this.usersService.verifyEmail(token);
  }
}
