import { Module } from '@nestjs/common';
import { UploaderService } from './uploader.service';
import { uploaderHandlers } from './handlers';
import { ImageOptimizerModule } from '@/storage/image-optimizer/image-optimizer.module';
import { VideoOptimizerModule } from '@/storage/video-optimizer/video-optimizer.module';

@Module({
  imports: [ImageOptimizerModule, VideoOptimizerModule],
  providers: [UploaderService, ...uploaderHandlers],
  exports: [UploaderService],
})
export class UploaderModule {}
