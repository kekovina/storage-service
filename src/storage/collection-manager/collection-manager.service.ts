import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import path from 'node:path';
import fs, { createReadStream } from 'node:fs';
import {
  AVAILABLE_PHOTO_MIMETYPES,
  DEFAULT_FOLDER,
  DEFAULT_PREVIEW_FOLDER,
  PHOTO_FOLDER,
  PHOTO_PREVIEW_FOLDER,
  VIDEO_FOLDER,
  VIDEO_PREVIEW_FOLDER,
} from '@/storage/config';
import { UploaderService } from '@/storage/uploader/upload.service';
import { getDirectories } from '@/storage/libs/getDirictories';
import { getFiles } from '@/storage/libs/getFiles';
import { CONTENT_TYPES, ERROR_CODES } from '@/consts';
import { UploadPhotoQueryDto } from './dto/photo-storage.dto';
import { ImageOptimizerService } from '@/image-optimizer/image-optimizer.service';
import { MultipartFile } from '@fastify/multipart';

@Injectable()
export class CollectionManagerService {
  private readonly contentType: CONTENT_TYPES = CONTENT_TYPES.DEFAULT;

  constructor(
    private readonly uploader: UploaderService,
    private readonly imageOptimizerService: ImageOptimizerService
  ) {}
  async upload(
    collection: string,
    parts: AsyncIterableIterator<MultipartFile>,
    opts?: UploadPhotoQueryDto
  ) {
    const collectionPath = path.join(this.getFolder(), collection);
    const previewCollectionPath = path.join(this.getPreviewFolder(), collection);

    const files: string[] = [];
    let uploadedCount = 0;
    let errorsCount = 0;
    const errors: Array<Record<string, string>> = [];

    for await (const part of parts) {
      const { mimetype, filename } = part;
      let newFilename = filename;
      if (!AVAILABLE_PHOTO_MIMETYPES.includes(mimetype)) {
        errorsCount++;
        errors.push({ [filename]: `Mimetype not allowed: ${mimetype}` });
        continue;
      }

      const buffer = await part.toBuffer();
      let processedBuffer = buffer;
      let previewBuffer: Buffer;
      if (opts?.optimize) {
        processedBuffer = await this.imageOptimizerService.convertToWebp(buffer);
        const parsedFile = path.parse(filename);
        newFilename = `${parsedFile.name}.webp`;
      }
      if (opts?.preview) {
        previewBuffer = await this.imageOptimizerService.generatePreview(
          processedBuffer,
          opts.previewSize
        );
        if (
          (await this.uploader.upload(previewCollectionPath, newFilename, previewBuffer)) ===
          undefined
        ) {
          uploadedCount++;
          files.push(`${newFilename}/preview`);
        } else {
          errorsCount++;
          errors.push({ [newFilename]: 'Could not upload preview' });
        }
      }
      if (
        (await this.uploader.upload(collectionPath, newFilename, processedBuffer)) === undefined
      ) {
        uploadedCount++;
        files.push(newFilename);
      } else {
        errorsCount++;
        errors.push({ [newFilename]: 'Could not upload file' });
      }
    }

    return {
      message: 'OK',
      uploadedCount,
      errorsCount,
      files,
      errors,
    };
  }

  getCollectionFiles(collection: string) {
    if (!fs.existsSync(path.join(this.getFolder(), collection)))
      throw new HttpException(
        {
          code: ERROR_CODES.COLLECTION_NOT_FOUND,
          message: 'Collection not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return getFiles(path.join(this.getFolder(), collection));
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
    if (!fs.existsSync(path.join(this.getFolder(), collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'File not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      const filePath = path.join(this.getFolder(), collection, filename);
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
    if (!fs.existsSync(path.join(this.getPreviewFolder(), collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'Preview not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      const filePath = path.join(this.getPreviewFolder(), collection, filename);
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
    if (!fs.existsSync(path.join(this.getFolder(), collection, filename)))
      throw new HttpException(
        {
          code: ERROR_CODES.FILE_NOT_FOUND,
          message: 'File not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return fs.unlinkSync(path.join(this.getFolder(), collection, filename));
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
    if (!fs.existsSync(path.join(this.getFolder(), collection)))
      throw new HttpException(
        {
          code: ERROR_CODES.COLLECTION_NOT_FOUND,
          message: 'Collection not found',
        },
        HttpStatus.NOT_FOUND
      );
    try {
      return fs.unlinkSync(path.join(this.getFolder(), collection));
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
      return getDirectories(this.getFolder());
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

  private getFolder() {
    switch (this.contentType) {
      case CONTENT_TYPES.PHOTO:
        return PHOTO_FOLDER;
      case CONTENT_TYPES.VIDEO:
        return VIDEO_FOLDER;
      default:
        return DEFAULT_FOLDER;
    }
  }

  private getPreviewFolder() {
    switch (this.contentType) {
      case CONTENT_TYPES.PHOTO:
        return PHOTO_PREVIEW_FOLDER;
      case CONTENT_TYPES.VIDEO:
        return VIDEO_PREVIEW_FOLDER;
      default:
        return DEFAULT_PREVIEW_FOLDER;
    }
  }
}
