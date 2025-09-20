import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import path from 'node:path';
import fs, { createReadStream } from 'node:fs';
import { AVAILABLE_MIMETYPES, FOLDER_PATH } from '@/storage/config';
import { UploaderService } from '@/storage/uploader/uploader.service';
import { getDirectories } from '@/storage/libs/getDirictories';
import { getFiles } from '@/storage/libs/getFiles';
import { ERROR_CODES } from '@/consts';
import { MultipartFile } from '@fastify/multipart';
import { parseMIMEToContentType } from '@/libs/parseMIMEToContentType';
import { UploadFileOptionsDto } from './dto/request.dto';

@Injectable()
export class StorageService {
  constructor(private readonly uploader: UploaderService) {}
  async upload(
    collection: string,
    parts: AsyncIterableIterator<MultipartFile>,
    options?: UploadFileOptionsDto
  ) {
    const files: string[] = [];
    let uploadedCount = 0;
    let errorsCount = 0;
    const errors: Array<Record<string, string>> = [];

    const collectionPath = path.join(FOLDER_PATH, collection);

    for await (const part of parts) {
      const { mimetype, filename } = part;
      if (!AVAILABLE_MIMETYPES.includes(mimetype)) {
        errorsCount++;
        errors.push({ [filename]: `Mimetype not allowed: ${mimetype}` });
        continue;
      }

      const contentType = parseMIMEToContentType(mimetype);
      const optionsByContentType = options?.[contentType];

      try {
        await this.uploader.upload(contentType, collectionPath, part, optionsByContentType);
        uploadedCount++;
        files.push(filename);
      } catch (e) {
        errorsCount++;
        errors.push({ [filename]: e.message });
      }
    }

    return {
      status: uploadedCount > 0,
      uploadedCount,
      errorsCount,
      files,
      errors,
    };
  }

  getCollectionFiles(collection: string) {
    if (!fs.existsSync(path.join(FOLDER_PATH, collection)))
      throw new HttpException(
        {
          code: ERROR_CODES.COLLECTION_NOT_FOUND,
          message: 'Collection not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return getFiles(path.join(FOLDER_PATH, collection));
    } catch (e) {
      throw new HttpException(
        {
          code: ERROR_CODES.DIR_READ_ERROR,
          message: 'Could not read collection',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  getFile(collection: string, filename: string) {
    if (!fs.existsSync(path.join(FOLDER_PATH, collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'File not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      const filePath = path.join(FOLDER_PATH, collection, filename);
      const stream = createReadStream(filePath);

      return { stream, filename };
    } catch (e) {
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_READ_ERROR,
          message: 'Could not read file',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  getPreview(collection: string, filename: string) {
    if (!fs.existsSync(path.join(FOLDER_PATH, collection, 'preview', filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'Preview not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      const filePath = path.join(FOLDER_PATH, collection, 'preview', filename);
      const stream = createReadStream(filePath);

      return { stream, filename };
    } catch (e) {
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_READ_ERROR,
          message: 'Could not read file',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  dropFile(collection: string, filename: string) {
    if (!fs.existsSync(path.join(FOLDER_PATH, collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'File not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return fs.unlinkSync(path.join(FOLDER_PATH, collection, filename));
    } catch (e) {
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_DELETE_ERROR,
          message: 'Could not delete file',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  dropCollection(collection: string) {
    if (!fs.existsSync(path.join(FOLDER_PATH, collection)))
      throw new HttpException(
        {
          code: ERROR_CODES.COLLECTION_NOT_FOUND,
          message: 'Collection not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return fs.unlinkSync(path.join(FOLDER_PATH, collection));
    } catch (e) {
      throw new HttpException(
        {
          code: ERROR_CODES.COLLECTION_DELETE_ERROR,
          message: 'Could not delete collection',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  getAllCollections() {
    try {
      return getDirectories(FOLDER_PATH);
    } catch (e) {
      throw new HttpException(
        {
          code: ERROR_CODES.DIR_READ_ERROR,
          message: 'Could not read collections',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
