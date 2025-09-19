import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';
import validationSchema from '@/env.validation';
import { UploaderModule } from './storage/uploader/uploader.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    StorageModule,
    UploaderModule,
  ],
})
export class AppModule {}
