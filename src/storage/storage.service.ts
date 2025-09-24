import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import path from 'node:path';
import fs from 'node:fs';
import { FOLDER_PATH } from '@/storage/config';
import { UploaderService } from '@/storage/uploader/uploader.service';
import { getDirectories } from '@/storage/libs/getDirictories';
import { getFiles } from '@/storage/libs/getFiles';
import { ERROR_CODES } from '@/consts';
import { parseMIMEToContentType } from '@/libs/parseMIMEToContentType';
import { UploadFileOptionsDto } from './dto/request.dto';
import { mkdir } from 'node:fs/promises';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageService {
  constructor(
    private readonly uploader: UploaderService,
    private readonly configService: ConfigService
  ) {}
  async upload(collection: string, file: Express.Multer.File, options?: UploadFileOptionsDto) {
    const collectionPath = path.join(FOLDER_PATH, collection);
    const { mimetype } = file;
    if (!this.configService.get('ACCEPTED_MIME_TYPES').includes(mimetype)) {
      throw new HttpException(
        { message: 'Unsupported MIME type', code: ERROR_CODES.UNSUPPORTED_MIME_TYPE },
        HttpStatus.BAD_REQUEST
      );
    }

    const contentType = parseMIMEToContentType(mimetype);
    const optionsByContentType = options?.[contentType];
    try {
      const result = await this.uploader.upload(
        contentType,
        collectionPath,
        file,
        optionsByContentType
      );

      return {
        error: false,
        fileUrl: `/storage/${collection}/${result.filename}`,
        previewUrl: result.preview ? `/storage/${collection}/preview/${result.preview}` : null,
      };
    } catch (e) {
      throw new HttpException(
        { message: e.message, code: ERROR_CODES.FILE_UPLOAD_ERROR },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
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

  getFile(collection: string, filename: string, isPreview = false) {
    if (!fs.existsSync(path.join(FOLDER_PATH, collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'File not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      const filePath = path.join(
        FOLDER_PATH,
        collection,
        isPreview ? 'preview/' + filename : filename
      );

      return filePath;
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

  async getAllCollections() {
    try {
      return await getDirectories(FOLDER_PATH);
    } catch (e) {
      if (e.message.includes('no such file or directory')) {
        try {
          await mkdir(FOLDER_PATH, { recursive: true });
          return [];
        } catch (e) {
          throw new HttpException(
            {
              code: ERROR_CODES.CREATE_UPLOAD_DIR_ERROR,
              message: 'Could not create upload directory',
            },
            HttpStatus.INTERNAL_SERVER_ERROR
          );
        }
      }
    }
  }
}
