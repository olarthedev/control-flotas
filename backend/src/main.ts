import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // permitir peticiones desde el frontend (puedes afinar los orígenes si quieres)
  app.enableCors();

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Control Flotas API')
    .setDescription('Documentación de la API de control de flotas')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
