import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkOrCreateCollectionExists } from '@/storage/libs/checkOrCreateCollectionExists';
import { CONTENT_TYPES, ERROR_CODES } from '@/consts';
import fs from 'fs';
import path, { extname } from 'path';
import { PhotoPrepareHandler } from './handlers/photo';
import { VideoPrepareHandler } from './handlers/video';
import { DefaultPrepareHandler } from './handlers/default';
import { FileHandler, FilePrepareOptions } from './handlers/types';
import { createHash, randomBytes } from 'crypto';

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
      const filename = decodeURIComponent(
        options?.keepOriginalFilename
          ? result.file.filename
          : this.generateFilename(result.file.filename)
      );
      await this.saveToStorage(targetPath, filename, result.file.buffer);
      if (result.preview) {
        await this.saveToStorage(path.join(targetPath, 'preview'), filename, result.preview.buffer);
      }
      return {
        preview: result.preview ? filename : null,
        filename,
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

  private generateFilename(originalName: string) {
    const random = randomBytes(16).toString('hex');
    const data = `${Date.now()}-${random}-${originalName}`;

    const ext = extname(originalName);

    const hash = createHash('sha256').update(data).digest('hex').slice(0, 20);

    return `${hash}${ext}`;
  }
}
