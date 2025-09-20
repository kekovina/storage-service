import { FileHandler } from './types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoPrepareHandler implements FileHandler {
  async process(file: Express.Multer.File) {
    return {
      file: {
        buffer: file.buffer,
        filename: file.filename,
      },
      isPrepared: true as const,
    };
  }
}
