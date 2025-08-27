import { Module } from '@nestjs/common';
import { PhotoStorageService } from './photo/photo-storage.service';
import { PhotoStorageController } from './photo/photo-storage.controller';
import { VideoStorageService } from './video/video-storage.service';
import { VideoStorageController } from './video/video-storage.controller';
import { UploaderService } from './uploader/upload.service';
import { ImageOptimizerModule } from '@/image-optimizer/image-optimizer.module';

@Module({
  imports: [ImageOptimizerModule],
  controllers: [VideoStorageController, PhotoStorageController],
  providers: [VideoStorageService, PhotoStorageService, UploaderService],
})
export class StorageModule {}
