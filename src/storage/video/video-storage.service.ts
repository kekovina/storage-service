import { Injectable } from '@nestjs/common';
import { AVAILABLE_VIDEO_MIMETYPES, VIDEO_FOLDER } from '@/storage/config';
import path from 'node:path';
import { UploaderService } from '@/storage/uploader/upload.service';

@Injectable()
export class VideoStorageService {
  constructor(private readonly uploader: UploaderService) {}
  async upload(collection: string, parts: any) {
    const collectionPath = path.join(VIDEO_FOLDER, collection);
    return this.uploader.upload(collectionPath, parts, AVAILABLE_VIDEO_MIMETYPES);
  }

  findAll() {
    return `This action returns all storage`;
  }

  findOne(id: number) {
    return `This action returns a #${id} storage`;
  }

  remove(id: number) {
    return `This action removes a #${id} storage`;
  }
}
