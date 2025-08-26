import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import SwaggerConfig from '@/config/swagger.config';
import { ConfigService } from '@nestjs/config';
import multipart from '@fastify/multipart';

async function bootstrap() {
  const isProduction = process.env.NODE_ENV === 'production';
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  if (!isProduction) {
    const document = SwaggerModule.createDocument(app, SwaggerConfig);
    SwaggerModule.setup('api', app, document);
  }

  const configService = app.get(ConfigService);
  const port = configService.get('APP_PORT') as number;

  await app.register(multipart);

  await app.listen(port || 3000, '0.0.0.0', (_, address) => {
    Logger.log(`Application is running on: ${address}`, 'Bootstrap');
  });
}

bootstrap();
