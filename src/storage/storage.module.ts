import { Module } from '@nestjs/common';
import { UploaderService } from './uploader/uploader.service';
import { ImageOptimizerModule } from '@/image-optimizer/image-optimizer.module';

@Module({
  imports: [ImageOptimizerModule],
  providers: [UploaderService],
})
export class StorageModule {}
