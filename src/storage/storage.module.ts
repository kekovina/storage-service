import { Module } from '@nestjs/common';
import { UploaderModule } from './uploader/uploader.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { memoryStorage } from 'multer';

@Module({
  imports: [
    MulterModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        limits: {
          files: configService.get<number>('MAX_FILES_COUNT'),
          fileSize: configService.get<number>('MAX_FILE_SIZE'),
        },
        storage: memoryStorage(),
      }),
    }),
    UploaderModule,
  ],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
