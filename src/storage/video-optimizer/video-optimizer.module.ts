import { Module } from '@nestjs/common';
import { VideoOptimizerService } from './video-optimizer.service';

@Module({
  providers: [VideoOptimizerService],
  exports: [VideoOptimizerService],
})
export class VideoOptimizerModule {}
