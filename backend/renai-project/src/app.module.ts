import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ProjectsModule } from './projects/projects.module';
import { UsersModule } from './users/users.module';
import { MailerService } from './mailer/mailer.service';
import { FoldersModule } from './folders/folders.module';
import { FieldsModule } from './fields/fields.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRoot(process.env.MONGO_URI!),
    UsersModule,
    AuthModule,
    ProjectsModule,
    FoldersModule,
    FieldsModule,
  ],
  providers: [MailerService],
})
export class AppModule {}
