import { Module } from '@nestjs/common';
import { UploaderModule } from './uploader/uploader.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';

@Module({
  imports: [UploaderModule],
  controllers: [StorageController],
  providers: [StorageService],
})
export class StorageModule {}
