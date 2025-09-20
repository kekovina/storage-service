import { Module } from '@nestjs/common';
import { UploaderService } from './uploader.service';
import { uploaderHandlers } from './handlers';
import { ImageOptimizerModule } from '@/storage/image-optimizer/image-optimizer.module';

@Module({
  imports: [ImageOptimizerModule],
  providers: [UploaderService, ...uploaderHandlers],
  exports: [UploaderService],
})
export class UploaderModule {}
