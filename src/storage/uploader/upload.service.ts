import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { checkOrCreateCollectionExists } from '@/storage/libs/checkOrCreateCollectionExists';
import { ERROR_CODES } from '@/consts';
import fs from 'fs';
import path from 'path';

@Injectable()
export class UploaderService {
  async upload(targetPath: string, fileName: string, buffer: Buffer) {
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
