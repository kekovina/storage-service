import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { StorageModule } from './storage/storage.module';
import { ImageOptimizerService } from './image-optimizer/image-optimizer.service';
import validationSchema from '@/env.validation';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    StorageModule,
  ],
  providers: [ImageOptimizerService],
})
export class AppModule {}
