import { FileHandler } from './types';

export class DefaultHandler implements FileHandler {
  async process(file: Buffer) {
    return file;
  }
}
