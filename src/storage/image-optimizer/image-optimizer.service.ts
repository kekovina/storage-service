import { Injectable } from '@nestjs/common';
import sharp from 'sharp';

@Injectable()
export class ImageOptimizerService {
  async convertToWebp(
    imageBuffer: Buffer,
    maxSizeInBytes: number = 100 * 1024,
    initialQuality: number = 90,
    step: number = 10,
    minQuality: number = 10
  ) {
    return this.compressImage(imageBuffer, maxSizeInBytes, initialQuality, step, minQuality);
  }

  async generatePreview(imageBuffer: Buffer, sizePercentage: number = 50) {
    const image = sharp(imageBuffer);
    const metadata = await image.metadata();
    if (!metadata.width || !metadata.height) {
      throw new Error('Image metadata not found');
    }

    const width = Math.round(metadata.width * (sizePercentage / 100));
    const height = Math.round(metadata.height * (sizePercentage / 100));
    return sharp(imageBuffer).resize({ width, height }).toBuffer();
  }

  private async compressImage(
    buffer: Buffer,
    maxSizeInBytes: number,
    quality: number,
    step: number,
    minQuality: number
  ): Promise<Buffer> {
    if (buffer.byteLength <= maxSizeInBytes) return buffer;
    if (quality <= minQuality) return buffer;

    const compressedBuffer = await sharp(buffer).webp({ quality }).toBuffer();
    return this.compressImage(compressedBuffer, maxSizeInBytes, quality - step, step, minQuality);
  }
}
