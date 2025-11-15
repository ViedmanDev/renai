import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) { }

  async login(email: string, password: string) {
    try {
      const user = await this.userModel.findOne({ email }).select('+password');
      if (!user) throw new UnauthorizedException('Usuario no encontrado');

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) throw new UnauthorizedException('Contraseña incorrecta');

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
    } catch (error: unknown) {
      console.error('Error en login:', error);
      if (error instanceof UnauthorizedException) throw error;
      throw new InternalServerErrorException('Error interno en el servidor');
    }
  }

  async register(name: string, email: string, password: string) {
    try {
      // VALIDACIONES DE ENTRADA

      // Validar nombre
      if (!name || name.trim().length === 0) {
        throw new UnauthorizedException('El nombre es requerido');
      }
      if (name.trim().length < 2) {
        throw new UnauthorizedException('El nombre debe tener al menos 2 caracteres');
      }
      if (name.trim().length > 50) {
        throw new UnauthorizedException('El nombre no puede tener más de 50 caracteres');
      }

      // Validar email
      if (!email || email.trim().length === 0) {
        throw new UnauthorizedException('El email es requerido');
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new UnauthorizedException('El formato del email no es válido');
      }
      if (email.length > 100) {
        throw new UnauthorizedException('El email es demasiado largo');
      }

      // Validar contraseña
      if (!password || password.length === 0) {
        throw new UnauthorizedException('La contraseña es requerida');
      }
      if (password.length < 6) {
        throw new UnauthorizedException('La contraseña debe tener al menos 6 caracteres');
      }
      if (password.length > 100) {
        throw new UnauthorizedException('La contraseña es demasiado larga');
      }

      // Validar complejidad de contraseña
      const hasLetter = /[a-zA-Z]/.test(password);
      const hasNumber = /[0-9]/.test(password);
      if (!hasLetter || !hasNumber) {
        throw new UnauthorizedException('La contraseña debe contener letras y números');
      }

      // Contraseñas débiles comunes
      const weakPasswords = ['123456', 'password', 'qwerty', '111111', 'abc123'];
      if (weakPasswords.includes(password.toLowerCase())) {
        throw new UnauthorizedException('Esta contraseña es demasiado débil');
      }

      // Verificar si el usuario ya existe
      const existing = await this.userModel.findOne({
        email: email.toLowerCase().trim()
      });
      if (existing) {
        throw new UnauthorizedException('El usuario ya existe');
      }

      // Crear usuario
      const hashed = await bcrypt.hash(password, 10);
      const newUser = new this.userModel({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashed
      });
      const savedUser = await newUser.save();

      const userId = (savedUser._id as Types.ObjectId).toString();

      const token = jwt.sign(
        { id: userId, email: savedUser.email },
        process.env.JWT_SECRET || 'SECRET_KEY',
        { expiresIn: '1d' },
      );

      console.log('✅ Usuario registrado:', savedUser.email);

      return {
        message: 'Usuario registrado correctamente',
        token,
        user: {
          id: userId,
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

      const userId = (user._id as Types.ObjectId).toString();

      return {
        user: {
          id: userId,
          name: user.name,
          email: user.email,
          picture: user.picture,
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

  //  NUEVO: Método para autenticación con Google
  async googleLogin(googleUser: any) {
    try {
      const { googleId, email, name, picture } = googleUser;

      console.log('Intentando login con Google:', { email, name });

      // Buscar usuario existente por email
      let user = await this.userModel.findOne({ email });

      if (!user) {
        //  PRIMER INGRESO: Crear nuevo usuario automáticamente
        console.log('Usuario nuevo, creando perfil...');
        user = new this.userModel({
          name,
          email,
          password: '', // Sin password porque usa Google
          googleId,
          picture,
        });
        await user.save();
        console.log('✅ Perfil creado automáticamente:', email);
      } else if (!user.googleId) {
        // Usuario existe con email/password, vincular con Google
        console.log('Usuario existente, vinculando con Google...');
        user.googleId = googleId;
        if (picture) user.picture = picture;
        await user.save();
        console.log('✅ Cuenta vinculada con Google:', email);
      } else {
        // Usuario ya tenía Google OAuth
        console.log('✅ Usuario Google existente:', email);
      }

      const userId = (user._id as Types.ObjectId).toString();

      // Token con duración más larga para SSO
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
    } catch (error: unknown) {
      console.error('Error en Google login:', error);
      throw new InternalServerErrorException('Error al autenticar con Google');
    }
  }
  // ✅ NUEVO: Método para establecer contraseña
  async setPassword(token: string, newPassword: string) {
    try {
      // Validar que la contraseña tenga al menos 6 caracteres
      if (!newPassword || newPassword.length < 6) {
        throw new UnauthorizedException('La contraseña debe tener al menos 6 caracteres');
      }

      // Decodificar el token para obtener el ID del usuario
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'SECRET_KEY',
      ) as { id: string; email: string };

      // Buscar el usuario
      const user = await this.userModel.findById(decoded.id);
      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Hash de la nueva contraseña
      const hashed = await bcrypt.hash(newPassword, 10);
      user.password = hashed;
      await user.save();

      console.log('✅ Contraseña establecida para:', user.email);

      return {
        message: 'Contraseña establecida correctamente',
        success: true,
      };
    } catch (error: unknown) {
      console.error('Error estableciendo contraseña:', error);

      if (error instanceof UnauthorizedException) {
        throw error;
      }

      if (error && typeof error === 'object' && 'name' in error) {
        const err = error as { name: string };
        if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
          throw new UnauthorizedException('Token inválido o expirado');
        }
      }

      throw new InternalServerErrorException('Error al establecer contraseña');
    }
  }
}