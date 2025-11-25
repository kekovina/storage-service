import { FileHandler, FilePrepareStatusSuccess, VideoHandlerOptions } from './types';
import { Injectable } from '@nestjs/common';
import { VideoOptimizerService } from '@/storage/video-optimizer/video-optimizer.service';
import { ERROR_CODES } from '@/consts';
import path from 'path';

@Injectable()
export class VideoPrepareHandler implements FileHandler {
  constructor(private readonly videoOptimizerService: VideoOptimizerService) {}

  async process(file: Express.Multer.File, options?: VideoHandlerOptions) {
    try {
      const isGif = file.mimetype === 'image/gif';

      const processedBuffer = file.buffer;
      const result = {
        file: {
          buffer: processedBuffer,
          filename: file.originalname,
        },
        isPrepared: true as const,
      } as FilePrepareStatusSuccess;

      if (options?.optimize && isGif) {
        const { file: optimizedFile, filename } = await this.optimize(
          processedBuffer,
          result.file.filename
        );
        result.file = {
          buffer: optimizedFile,
          filename,
        };
      }

      return result;
    } catch (e) {
      return {
        isPrepared: false as const,
        error: {
          code: ERROR_CODES.FILE_PREPARE_ERROR,
          message: e.message,
        },
      };
    }
  }

  private async optimize(file: Buffer, filename: string) {
    const processedBuffer = await this.videoOptimizerService.convertGifToWebm(file);
    const parsedFile = path.parse(filename);
    const newFilename = `${parsedFile.name}.webm`;

    return {
      file: processedBuffer,
      filename: newFilename,
    };
  }
}
