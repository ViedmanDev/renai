import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose'; // ✅ Importar Types
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email }).select('+password');
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('Contraseña incorrecta');

      const userId = (user._id as Types.ObjectId).toString(); // ✅ Cast correcto

      const token = jwt.sign(
        { id: userId, email: user.email },
        process.env.JWT_SECRET || 'SECRET_KEY',
        { expiresIn: '1d' },
      );

      return {
        message: 'Login exitoso',
        token,
        user: {
          id: userId, // ✅ Usar variable
          name: user.name,
          email: user.email,
        },
      };
    } catch (error: unknown) {
      console.error('Error en login:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Error interno en el servidor');
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      const existing = await this.userModel.findOne({ email });
      if (existing) throw new UnauthorizedException('El usuario ya existe');

      const hashed = await bcrypt.hash(password, 10);
      const newUser = new this.userModel({ name, email, password: hashed });
      const savedUser = await newUser.save();

      const userId = (savedUser._id as Types.ObjectId).toString(); // ✅ Cast correcto

      const token = jwt.sign(
        { id: userId, email: savedUser.email },
        process.env.JWT_SECRET || 'SECRET_KEY',
        { expiresIn: '1d' },
      );

      return {
        message: 'Usuario registrado correctamente',
        token,
        user: {
          id: userId, // ✅ Usar variable
          name: savedUser.name,
          email: savedUser.email,
        },
      };
    } catch (error: unknown) {
      console.error('Error en registro:', error);
      if (error instanceof UnauthorizedException) throw error;
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
        .select('-password')
        .exec();

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      const userId = (user._id as Types.ObjectId).toString(); // ✅ Cast correcto

      return {
        user: {
          id: userId, // ✅ Usar variable
          name: user.name,
          email: user.email,
        },
      };
    } catch (error: unknown) {
      console.error('Error verificando token:', error);

      if (error && typeof error === 'object' && 'name' in error) {
        const err = error as { name: string };
        if (err.name === 'JsonWebTokenError') {
          throw new UnauthorizedException('Token inválido');
        }
        if (err.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token expirado');
        }
      }

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new UnauthorizedException('Error al verificar token');
    }
  }
}