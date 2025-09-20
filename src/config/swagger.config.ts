import { DocumentBuilder } from '@nestjs/swagger';

const SwaggerConfig = new DocumentBuilder()
  .setTitle('@kekovina/storage-service')
  .setDescription('Storage service')
  .setVersion('1.0')
  .addBearerAuth()
  .build();

export default SwaggerConfig;
