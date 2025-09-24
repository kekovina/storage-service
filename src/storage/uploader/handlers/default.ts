import { FileHandler } from './types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class DefaultPrepareHandler implements FileHandler {
  async process(file: Express.Multer.File) {
    return {
      file: {
        buffer: file.buffer,
        filename: file.originalname,
      },
      isPrepared: true as const,
    };
  }
}
