import { FileHandler } from './types';

export class VideoHandler implements FileHandler {
  async process(file: Buffer) {
    return file;
  }
}
