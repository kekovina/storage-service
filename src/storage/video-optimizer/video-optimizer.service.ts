import { Injectable } from '@nestjs/common';
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

@Injectable()
export class VideoOptimizerService {
  async convertGifToWebm(gifBuffer: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const inputStream = Readable.from(gifBuffer);

      ffmpeg(inputStream)
        .inputFormat('gif')
        .outputFormat('webm')
        .videoCodec('libvpx')
        .outputOptions([
          '-crf 10', // Quality (0-63, lower is better)
          '-b:v 1M', // Bitrate
          '-auto-alt-ref 0', // Disable alt reference frames (fixes some issues)
        ])
        .on('error', (err) => {
          reject(new Error(`FFmpeg conversion failed: ${err.message}`));
        })
        .on('end', () => {
          resolve(Buffer.concat(chunks));
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        });
    });
  }
}
