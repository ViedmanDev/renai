import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User } from '../schemas/user.schema';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    private mailer: MailerService,
  ) {}

  private generateToken() {
    return crypto.randomBytes(32).toString('hex'); // 64 chars
  }

  async createUser(name: string, email: string, password: string) {
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) throw new BadRequestException('Email ya registrado');

    const passwordHash = await bcrypt.hash(password, 10);
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas

    const user = await this.userModel.create({
      name,
      email,
      passwordHash,
      isEmailVerified: false,
      emailVerificationToken: token,
      emailVerificationTokenExpiresAt: expiresAt,
    });

    await this.mailer.sendVerificationEmail(email, token);
    return { id: user._id, email: user.email };
  }

  async resendVerification(email: string) {
    const user = await this.userModel.findOne({ email }).exec();
    if (!user) throw new NotFoundException('Usuario no encontrado');
    if (user.isEmailVerified)
      throw new BadRequestException('Email ya verificado');

    const token = this.generateToken();
    user.emailVerificationToken = token;
    user.emailVerificationTokenExpiresAt = new Date(
      Date.now() + 24 * 60 * 60 * 1000,
    );
    await user.save();

    await this.mailer.sendVerificationEmail(email, token);
    return { ok: true };
  }

  async verifyEmail(token: string) {
    if (!token) throw new BadRequestException('Token requerido');

    const user = await this.userModel
      .findOne({
        emailVerificationToken: token,
      })
      .exec();

    if (!user) throw new BadRequestException('Token inválido o ya usado');

    if (
      !user.emailVerificationTokenExpiresAt ||
      user.emailVerificationTokenExpiresAt < new Date()
    ) {
      throw new BadRequestException('Token expirado');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationTokenExpiresAt = undefined;
    await user.save();

    return { ok: true, email: user.email };
  }
}
