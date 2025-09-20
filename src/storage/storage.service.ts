import { HttpException, HttpStatus, Injectable, StreamableFile } from '@nestjs/common';
import path from 'node:path';
import fs, { createReadStream } from 'node:fs';
import { FOLDER_PATH } from '@/storage/config';
import { UploaderService } from '@/storage/uploader/uploader.service';
import { getDirectories } from '@/storage/libs/getDirictories';
import { getFiles } from '@/storage/libs/getFiles';
import { ERROR_CODES } from '@/consts';
import { MultipartFile } from '@fastify/multipart';
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
  async upload(
    collection: string,
    parts: AsyncIterableIterator<MultipartFile>,
    options?: UploadFileOptionsDto
  ) {
    const files: string[] = [];
    const counters = { uploadedCount: 0, errorsCount: 0 };
    const errors: Array<Record<string, string>> = [];

    const collectionPath = path.join(FOLDER_PATH, collection);

    try {
      for await (const part of parts) {
        const result = await this.handlePart(part, collectionPath, options);
        if (result.error) {
          errors.push({ filename: part.filename, message: result.message });
          counters.errorsCount++;
        } else {
          files.push(part.filename);
          counters.uploadedCount++;
        }
      }
    } catch (e) {
      throw new HttpException(
        {
          message: 'No files to upload',
          code: ERROR_CODES.NO_FILES_TO_UPLOAD,
        },
        HttpStatus.BAD_REQUEST
      );
    }

    return {
      status: counters.uploadedCount > 0,
      uploadedCount: counters.uploadedCount,
      errorsCount: counters.errorsCount,
      files,
      errors,
    };
  }

  download(collection: string, filename: string) {
    const { stream, filename: name } = this.getFile(collection, filename);
    return new StreamableFile(stream, {
      type: 'application/pdf',
      disposition: `attachment; filename="${name}"`,
    });
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

  private async handlePart(
    part: MultipartFile,
    collectionPath: string,
    options?: UploadFileOptionsDto
  ) {
    const { mimetype, filename } = part;
    if (!this.configService.get('ACCEPTED_MIME_TYPES').includes(mimetype)) {
      return { error: true, message: 'Unsupported MIME type', filename };
    }
    const contentType = parseMIMEToContentType(mimetype);
    const optionsByContentType = options?.[contentType];
    try {
      await this.uploader.upload(contentType, collectionPath, part, optionsByContentType);
      return { error: false, filename };
    } catch (e) {
      return { error: true, message: e.message, filename };
    }
  }
}
