import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose'; // <--- agregar esto
import { AppController } from './app.controller';
import { AppService } from './app.service';

@Module({
  imports: [
    MongooseModule.forRoot('mongodb://localhost:27017/miapp'), // asegúrate de poner el nombre de tu BD
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
