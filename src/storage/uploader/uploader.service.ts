import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkOrCreateCollectionExists } from '@/storage/libs/checkOrCreateCollectionExists';
import { CONTENT_TYPES, ERROR_CODES } from '@/consts';
import fs from 'fs';
import path from 'path';
import { PhotoPrepareHandler } from './handlers/photo';
import { VideoPrepareHandler } from './handlers/video';
import { DefaultPrepareHandler } from './handlers/default';
import { FileHandler, FilePrepareOptions } from './handlers/types';

@Injectable()
export class UploaderService {
  constructor(
    private readonly photoPrepareHandler: PhotoPrepareHandler,
    private readonly videoPrepareHandler: VideoPrepareHandler,
    private readonly defaultPrepareHandler: DefaultPrepareHandler
  ) {}
  async upload(
    contentType: CONTENT_TYPES,
    targetPath: string,
    file: Express.Multer.File,
    options?: FilePrepareOptions
  ) {
    const handler = this.getHandler(contentType);
    const result = await handler.process(file, options);
    if (result.isPrepared) {
      await this.saveToStorage(targetPath, result.file.filename, result.file.buffer);
      if (result.preview) {
        await this.saveToStorage(
          path.join(targetPath, 'preview'),
          result.preview.filename,
          result.preview.buffer
        );
      }
      return {
        preview: result.preview?.filename,
        filename: result.file?.filename,
      };
    }
    throw new Error(result.error.message);
  }

  private getHandler(type: CONTENT_TYPES): FileHandler {
    switch (type) {
      case CONTENT_TYPES.PHOTO:
        return this.photoPrepareHandler;
      case CONTENT_TYPES.VIDEO:
        return this.videoPrepareHandler;
      default:
        return this.defaultPrepareHandler;
    }
  }

  private async saveToStorage(targetPath: string, fileName: string, buffer: Buffer) {
    if (!(await checkOrCreateCollectionExists(targetPath))) {
      throw new HttpException(
        {
          message: 'Could not create collection',
          code: ERROR_CODES.CREATE_COLLECTION_DIR_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
    try {
      return fs.writeFileSync(path.join(targetPath, fileName), buffer);
    } catch (e) {
      return false;
    }
  }
}
