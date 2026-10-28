import { Module } from '@nestjs/common';
import { ImageOptimizerService } from './image-optimizer.service';
import { ImageVariantsService } from './image-variants.service';

@Module({
  providers: [ImageOptimizerService, ImageVariantsService],
  exports: [ImageOptimizerService, ImageVariantsService],
})
export class ImageOptimizerModule {}
