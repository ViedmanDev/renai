import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private mailer: MailerService,
  ) {}

  private generateToken() {
    return crypto.randomBytes(32).toString('hex');
  }

  async createUser(name: string, email: string, password: string) {
    const existing = await this.userModel.findOne({ email }).exec();
    if (existing) throw new BadRequestException('Email ya registrado');

    const passwordHash = await bcrypt.hash(password, 10);
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const user = await this.userModel.create({
      name,
      email,
      password: passwordHash,
      isEmailVerified: false,
      emailVerificationToken: token,
      emailVerificationExpires: expiresAt,
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
    user.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
    await user.save();

    await this.mailer.sendVerificationEmail(email, token);
    return { ok: true };
  }

  async verifyEmail(token: string) {
    if (!token) throw new BadRequestException('Token requerido');

    const user = await this.userModel
      .findOne({ emailVerificationToken: token })
      .exec();
    if (!user) throw new BadRequestException('Token inválido o ya usado');

    if (
      !user.emailVerificationExpires ||
      user.emailVerificationExpires < new Date()
    ) {
      throw new BadRequestException('Token expirado');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return { ok: true, email: user.email };
  }
}
