import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { createWriteStream } from 'fs';
import * as path from 'path';
import { checkOrCreateCollectionExists } from '@/storage/libs/checkOrCreateCollectionExists';
import { ERROR_CODES } from '@/consts';

@Injectable()
export class UploaderService {
  async upload(folderPath: string, parts: AsyncIterableIterator<any>, allowedMimetypes: string[]) {
    if (!(await checkOrCreateCollectionExists(folderPath))) {
      throw new HttpException(
        {
          statusCode: 500,
          message: 'Could not create collection',
          code: ERROR_CODES.CREATE_COLLECTION_DIR_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }

    const files: string[] = [];
    let uploadedCount = 0;
    let errorsCount = 0;
    const errors: string[] = [];

    try {
      for await (const part of parts) {
        const { fieldname, mimetype } = part;
        if (!allowedMimetypes.includes(mimetype)) {
          errorsCount++;
          errors.push(`Mimetype not allowed: ${mimetype}`);
          continue;
        }

        const filePath = path.join(folderPath, fieldname);
        await new Promise<void>((resolve, reject) => {
          const stream = createWriteStream(filePath);
          part.file.pipe(stream);

          part.file.on('end', () => {
            uploadedCount++;
            files.push(filePath);
            resolve();
          });

          part.file.on('error', (err) => {
            errorsCount++;
            errors.push(err.message);
            reject(err);
          });
        });
      }

      return { message: 'OK', uploadedCount, errorsCount, errors, files };
    } catch (e: any) {
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_WRITE_ERROR,
          message: e.message,
          statusCode: 500,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
