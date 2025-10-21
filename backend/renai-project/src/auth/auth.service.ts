import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('Contraseña incorrecta');

      const token = jwt.sign(
        { id: user._id, email: user.email },
        process.env.JWT_SECRET || 'SECRET_KEY',
        { expiresIn: '1d' },
      );

      return {
        message: 'Login exitoso',
        token,
        user: { id: user._id, email: user.email },
      };
    } catch (error) {
      console.error('Error en login:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Error interno en el servidor');
    }
  }

  async register(email: string, password: string) {
    try {
      const existing = await this.userModel.findOne({ email });
      if (existing) throw new UnauthorizedException('El usuario ya existe');

      const hashed = await bcrypt.hash(password, 10);
      const newUser = new this.userModel({ email, password: hashed });
      const savedUser = await newUser.save();

      return {
        message: 'Usuario registrado correctamente',
        user: { id: savedUser._id, email: savedUser.email },
      };
    } catch (error) {
      console.error('Error en registro:', error);
      throw new InternalServerErrorException('Error al registrar usuario');
    }
  }
}
