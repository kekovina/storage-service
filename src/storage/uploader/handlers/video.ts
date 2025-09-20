import { MultipartFile } from '@fastify/multipart';
import { FileHandler } from './types';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VideoPrepareHandler implements FileHandler {
  async process(file: MultipartFile) {
    return {
      file: {
        buffer: await file.toBuffer(),
        filename: file.filename,
      },
      isPrepared: true as const,
    };
  }
}
