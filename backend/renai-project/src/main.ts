import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validación global
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: false,
      transform: true,
    }),
  );

  // ==========================
  // CORS CONFIG (Render friendly)
  // ==========================
  app.enableCors({
    origin: [
      'https://renai-2ebd.onrender.com', // frontend
      'http://localhost:3000', // local (opcional)
    ],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204, // IMPORTANTE para evitar el error 405 en Render
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

  console.log(`🚀 Backend corriendo en: http://localhost:${port}`);
  console.log(
    `📡 CORS habilitado para el frontend: https://renai-2ebd.onrender.com`,
  );
}

bootstrap();
