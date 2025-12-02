import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar validación global para los DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // Habilitar CORS para ambos puertos (frontend actual y nuevo)
  app.enableCors({
    origin: ['https://renai-2ebd.onrender.com'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🚀 Backend corriendo en: http://localhost:${port}`);
  console.log(`📡 CORS habilitado para: https://renai-2ebd.onrender.com`);
}
bootstrap();
