import { MultipartFile } from '@fastify/multipart';
import { FileHandler } from './types';

export class DefaultPrepareHandler implements FileHandler {
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
