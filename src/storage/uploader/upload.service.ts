import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkOrCreateCollectionExists } from '@/storage/libs/checkOrCreateCollectionExists';
import { CONTENT_TYPES, ERROR_CODES } from '@/consts';
import fs from 'fs';
import path from 'path';
import { PhotoHandler } from './handlers/photo';
import { VideoHandler } from './handlers/video';
import { DefaultHandler } from './handlers/default';

@Injectable()
export class UploaderService {
  async upload(contentType: CONTENT_TYPES, targetPath: string, parts: any) {
    const handler = this.getHandler(contentType);
    parts = await handler.process(parts);
    await this.saveToStorage(targetPath, parts[0].filename, parts[0].data);
  }

  private getHandler(type: CONTENT_TYPES) {
    switch (type) {
      case CONTENT_TYPES.PHOTO:
        return PhotoHandler;
      case CONTENT_TYPES.VIDEO:
        return VideoHandler;
      default:
        return DefaultHandler;
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
