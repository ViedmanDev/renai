// auth.service.ts
import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from '../schemas/user.schema';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { MailerService } from '../mailer/mailer.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private readonly mailerService: MailerService,
  ) {}

  async login(email: string, password: string) {
    console.log('🔐 Intentando login:', email);

    const user = await this.userModel.findOne({
      email: email.toLowerCase().trim()
    }).select('+password');

    if (!user) {
      console.log('❌ Usuario no encontrado');
      throw new UnauthorizedException('Usuario no encontrado');
    }

    console.log('✅ Usuario encontrado:', user.email);
    console.log('📝 Tiene password:', !!user.password);

    if (!user.password) {
      console.log(' Usuario sin contraseña (login con Google)');
      throw new UnauthorizedException(
        'Este usuario no tiene contraseña. Inicia sesión con Google o establece una contraseña.'
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    console.log('🔍 Resultado comparación:', valid);

    if (!valid) {
      console.log('Contraseña incorrecta');
      throw new UnauthorizedException('Contraseña incorrecta');
    }

    console.log(' Login exitoso');

    const userId = (user._id as Types.ObjectId).toString();
    const token = jwt.sign(
      { id: userId, email: user.email },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '1d' },
    );

    return {
      message: 'Login exitoso',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    };
  }

  async register(name: string, email: string, password: string) {
    try {
      console.log('📝 auth.service.register called');
      console.log('  name:', name);
      console.log('  email:', email);
      console.log('  password:', password ? `***${password.length} chars***` : 'UNDEFINED');
      const existing = await this.userModel.findOne({
        email: email.toLowerCase().trim(),
      });
      if (existing) throw new UnauthorizedException('El usuario ya existe');

      console.log('🔐 Hasheando password...');
      const hashed = await bcrypt.hash(password, 10);
      console.log('✅ Password hasheado correctamente');

      const newUser = new this.userModel({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed,
      });

      console.log('💾 Guardando usuario...');
      const savedUser = await newUser.save();
      console.log('✅ Usuario guardado:', savedUser.email);
      const userId = (savedUser._id as Types.ObjectId).toString();

      const token = jwt.sign(
        { id: userId, email: savedUser.email },
        process.env.JWT_SECRET || 'SECRET_KEY',
        { expiresIn: '1d' },
      );

      console.log('✅ Token generado');

      return {
        message: 'Usuario registrado correctamente',
        token,
        user: { id: userId, name: savedUser.name, email: savedUser.email },
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }

  async verifyToken(token: string) {
    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'SECRET_KEY',
      ) as { id: string; email: string };
      const user = await this.userModel
        .findById(decoded.id)
        .select('-password');
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      return {
        user: {
          id: (user._id as Types.ObjectId).toString(),
          name: user.name,
          email: user.email,
          picture: user.picture,
        },
      };
    } catch (error) {
      console.error('Error verificando token:', error);
      throw new UnauthorizedException('Token inválido o expirado');
    }
  }

  async forgotPassword(email: string) {
    try {
      const user = await this.userModel.findOne({
        email: email.toLowerCase().trim(),
      });
      if (!user)
        return {
          success: true,
          message: 'Si el email existe, recibirás un correo de recuperación',
        };

      const resetToken = crypto.randomBytes(32).toString('hex');
      const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      user.resetPasswordToken = hashedToken;
      user.resetPasswordExpires = new Date(Date.now() + 3600000);
      await user.save();

      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const resetUrl = `${frontendUrl}/auth/reset-password?token=${resetToken}`;

      await this.mailerService.sendResetPasswordEmail(user.email, resetUrl);
      console.log('📧 Correo de recuperación enviado a:', user.email);

      return {
        success: true,
        message: 'Si el email existe, recibirás un correo de recuperación',
      };
    } catch (error) {
      console.error('Error en forgotPassword:', error);
      throw new InternalServerErrorException('Error al procesar la solicitud');
    }
  }

  async verifyResetToken(token: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) throw new UnauthorizedException('Token inválido o expirado');
    return { valid: true, email: user.email };
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await this.userModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });
    if (!user) throw new UnauthorizedException('Token inválido o expirado');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return { success: true, message: 'Contraseña restablecida correctamente' };
  }

  async setPassword(token: string, newPassword: string) {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || 'SECRET_KEY',
    ) as { id: string };
    const user = await this.userModel.findById(decoded.id);
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return { message: 'Contraseña establecida correctamente', success: true };
  }

  async googleLogin(googleUser: any) {
    const { googleId, email, name, picture } = googleUser;
    let user = await this.userModel.findOne({ email });

    if (!user) {
      user = new this.userModel({
        name,
        email,
        password: undefined,
        googleId,
        picture,
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (picture) user.picture = picture;
      await user.save();
    }

    const userId = (user._id as Types.ObjectId).toString();
    const token = jwt.sign(
      { id: userId, email: user.email },
      process.env.JWT_SECRET || 'SECRET_KEY',
      { expiresIn: '7d' },
    );

    return {
      message: 'Login con Google exitoso',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        picture: user.picture,
      },
    };
  }
}
