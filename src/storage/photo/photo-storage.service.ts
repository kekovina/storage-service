import { Injectable } from '@nestjs/common';
import path from 'node:path';
import { AVAILABLE_PHOTO_MIMETYPES, PHOTO_FOLDER } from '@/storage/config';
import { UploaderService } from '@/storage/uploader/upload.service';

@Injectable()
export class PhotoStorageService {
  constructor(private readonly uploader: UploaderService) {}
  async upload(collection: string, parts: any) {
    const collectionPath = path.join(PHOTO_FOLDER, collection);
    return this.uploader.upload(collectionPath, parts, AVAILABLE_PHOTO_MIMETYPES);
  }

  findAll(collection: string) {
    return `This action returns all storage`;
  }

  getFile(collection: string, filename: string) {
    return `This action returns a ${filename} storage`;
  }

  getPreview(collection: string, filename: string) {
    return `This action returns a ${filename} storage`;
  }

  remove(collection: string, filename: string) {
    return `This action removes a ${filename} storage`;
  }

  dropCollection(collection: string) {
    return `This action drops the ${collection} collection`;
  }

  getAllCollections(collections: string) {
    return `This action returns all collections: ${collections}`;
  }
}
