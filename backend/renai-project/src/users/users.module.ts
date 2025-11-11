import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersService } from './users.service';
import { UsersController } from '../users/users.controller';
import { User, UserSchema } from '../auth/user.schema';
import { MailerService } from '../mailer/mailer.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  providers: [UsersService, MailerService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
