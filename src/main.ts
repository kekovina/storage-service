import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import SwaggerConfig from '@/config/swagger.config';
import { ConfigService } from '@nestjs/config';
import { supportedMimeTypes } from './consts';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const isSwaggerEnabled = !!parseInt(configService.get('SWAGGER_ENABLED') as string);

  const mimeTypes =
    configService
      .get('ACCEPTED_MIME_TYPES')
      ?.split(',')
      .map((mimeType) => mimeType.trim()) ?? supportedMimeTypes;

  const invalid = mimeTypes.filter((mime) => !supportedMimeTypes.includes(mime));

  if (invalid.length > 0) {
    throw new Error(`Found unsupported MIME: ${invalid.join(', ')}`);
  }

  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));

  if (isSwaggerEnabled) {
    const document = SwaggerModule.createDocument(app, SwaggerConfig);
    SwaggerModule.setup('api', app, document);
  }
  const port = configService.get('APP_PORT') as number;

  await app.listen(port || 3000, '0.0.0.0', async () => {
    Logger.log(`Application is running on: ${await app.getUrl()}`, 'Bootstrap');
  });
}

bootstrap();
