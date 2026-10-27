import { Module } from '@nestjs/common';
import { UploaderModule } from './uploader/uploader.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';
import { ImageVariantsService } from './image-optimizer/image-variants.service';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        limits: {
          fileSize: configService.get<number>('MAX_FILE_SIZE'),
        },
        storage: memoryStorage(),
      }),
    }),
    UploaderModule,
  ],
  controllers: [StorageController],
  providers: [StorageService, ImageVariantsService],
})
export class StorageModule {}
