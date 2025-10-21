import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import { User, UserDocument } from './user.schema';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) throw new UnauthorizedException('Usuario no encontrado');

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException('Contraseña incorrecta');

    const token = jwt.sign({ id: user._id, email: user.email }, 'SECRET_KEY', {
      expiresIn: '1d',
    });
    return { token };
  }

  async register(email: string, password: string) {
    const hashed = await bcrypt.hash(password, 10);
    const newUser = new this.userModel({ email, password: hashed });
    return newUser.save();
  }
}
