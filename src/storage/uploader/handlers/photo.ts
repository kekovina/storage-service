import { FileHandler } from './types';

export class PhotoHandler implements FileHandler {
  async process(file: Buffer, options: PhotoHandlerOptions) {
    let processedBuffer = file;
    let previewBuffer: Buffer;
    if (options?.optimize) {
      processedBuffer = await this.imageOptimizerService.convertToWebp(file);
      const parsedFile = path.parse(filename);
      newFilename = `${parsedFile.name}.webp`;
    }
    if (options?.preview) {
      previewBuffer = await this.imageOptimizerService.generatePreview(
        processedBuffer,
        options.previewSize
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
    return file;
  }
}
