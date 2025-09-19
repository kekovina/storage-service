import { Module } from '@nestjs/common';
import { UploaderService } from './uploader.service';
import { uploaderHandlers } from './handlers';

@Module({
  imports: [],
  providers: [UploaderService, ...uploaderHandlers],
})
export class UploaderModule {}
