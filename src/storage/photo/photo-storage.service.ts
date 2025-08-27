import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import path from 'node:path';
import fs, { createReadStream } from 'node:fs';
import { AVAILABLE_PHOTO_MIMETYPES, PHOTO_FOLDER, PHOTO_PREVIEW_FOLDER } from '@/storage/config';
import { UploaderService } from '@/storage/uploader/upload.service';
import { getDirectories } from '@/storage/libs/getDirictories';
import { getFiles } from '@/storage/libs/getFiles';
import { ERROR_CODES } from '@/consts';

@Injectable()
export class PhotoStorageService {
  constructor(private readonly uploader: UploaderService) {}
  async upload(collection: string, parts: any) {
    const collectionPath = path.join(PHOTO_FOLDER, collection);
    return this.uploader.upload(collectionPath, parts, AVAILABLE_PHOTO_MIMETYPES);
  }

  getCollectionFiles(collection: string) {
    if (!fs.existsSync(path.join(PHOTO_FOLDER, collection)))
      throw new HttpException(
        {
          code: ERROR_CODES.COLLECTION_NOT_FOUND,
          message: 'Collection not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return getFiles(path.join(PHOTO_FOLDER, collection));
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
    if (!fs.existsSync(path.join(PHOTO_FOLDER, collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'File not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      const filePath = path.join(PHOTO_FOLDER, collection, filename);
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
    if (!fs.existsSync(path.join(PHOTO_PREVIEW_FOLDER, collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'Preview not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      const filePath = path.join(PHOTO_PREVIEW_FOLDER, collection, filename);
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
    if (!fs.existsSync(path.join(PHOTO_FOLDER, collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'File not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return fs.unlinkSync(path.join(PHOTO_FOLDER, collection, filename));
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
    if (!fs.existsSync(path.join(PHOTO_FOLDER, collection)))
      throw new HttpException(
        {
          code: ERROR_CODES.COLLECTION_NOT_FOUND,
          message: 'Collection not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return fs.unlinkSync(path.join(PHOTO_FOLDER, collection));
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
      return getDirectories(PHOTO_FOLDER);
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
