import { MultipartFile } from '@fastify/multipart';
import { FileHandler, FilePrepareStatusSuccess, PhotoHandlerOptions } from './types';
import path from 'path';
import { Injectable } from '@nestjs/common';
import { ImageOptimizerService } from '@/image-optimizer/image-optimizer.service';
import { ERROR_CODES } from '@/consts';

@Injectable()
export class PhotoPrepareHandler implements FileHandler {
  constructor(private readonly imageOptimizerService: ImageOptimizerService) {}
  async process(file: MultipartFile, options?: PhotoHandlerOptions) {
    try {
      const processedBuffer = await file.toBuffer();
      const result = {
        file: {
          buffer: processedBuffer,
          filename: file.filename,
        },
        preview: undefined,
        isPrepared: true as const,
      } as FilePrepareStatusSuccess;

      if (options?.optimize) {
        const { file, filename } = await this.optimize(processedBuffer, result.file.filename);
        result.file = {
          buffer: file,
          filename,
        };
      }

      if (options?.preview) {
        const { file, filename } = await this.createPreview(
          processedBuffer,
          result.file.filename,
          options?.previewSize
        );
        result.preview = {
          buffer: file,
          filename: filename,
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
    const processedBuffer = await this.imageOptimizerService.convertToWebp(file);
    const parsedFile = path.parse(filename);
    const newFilename = `${parsedFile.name}.webp`;

    return {
      file: processedBuffer,
      filename: newFilename,
    };
  }

  private async createPreview(file: Buffer, filename: string, previewSize?: number) {
    const processedBuffer = await this.imageOptimizerService.generatePreview(file, previewSize);
    const parsedFile = path.parse(filename);
    const newFilename = `${parsedFile.name}.webp`;

    return {
      file: processedBuffer,
      filename: newFilename,
    };
  }
}
