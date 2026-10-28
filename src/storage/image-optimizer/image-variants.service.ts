import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHash } from 'node:crypto';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ImageLimits, ImageParams, normalizeImageParams } from './image-params';

// GIF/SVG are served as is
const PROCESSABLE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

@Injectable()
export class ImageVariantsService {
  private readonly logger = new Logger(ImageVariantsService.name);
  private readonly inFlight = new Map<string, Promise<void>>();
  private readonly cacheRoot: string;
  private readonly limits: ImageLimits;

  constructor(config: ConfigService) {
    this.cacheRoot = path.resolve(config.get<string>('CACHE_FOLDER_PATH') as string);
    this.limits = {
      minSize: config.get<number>('IMAGE_MIN_SIZE') as number,
      maxSize: config.get<number>('IMAGE_MAX_SIZE') as number,
    };
  }

  /** Path to the cached variant, or `null` when the original must be served. */
  async getVariant(
    sourcePath: string,
    collection: string,
    filename: string,
    query: Record<string, unknown>
  ): Promise<string | null> {
    if (!PROCESSABLE_EXTENSIONS.has(path.extname(filename).toLowerCase())) return null;
    const params = normalizeImageParams(query, this.limits);
    if (!params) return null;

    const cachePath = path.join(this.fileDir(collection, filename), this.variantName(params));
    try {
      if (await this.isFresh(sourcePath, cachePath)) return cachePath;

      let pending = this.inFlight.get(cachePath);
      if (!pending) {
        pending = this.generate(sourcePath, cachePath, params).finally(() =>
          this.inFlight.delete(cachePath)
        );
        this.inFlight.set(cachePath, pending);
      }
      await pending;
      return cachePath;
    } catch (e) {
      this.logger.error(`Could not optimize ${collection}/${filename}: ${e.message}`);
      return null;
    }
  }

  async dropFile(collection: string, filename: string) {
    await fs.rm(this.fileDir(collection, filename), { recursive: true, force: true });
  }

  async dropCollection(collection: string) {
    await fs.rm(path.join(this.cacheRoot, collection), { recursive: true, force: true });
  }

  // hash keeps arbitrary filenames out of the cache path
  private fileDir(collection: string, filename: string) {
    const hash = createHash('sha1').update(filename).digest('hex').slice(0, 20);
    return path.join(this.cacheRoot, collection, hash);
  }

  private variantName({ width, height, quality }: ImageParams) {
    return `w${width ?? 0}_h${height ?? 0}_q${quality}.webp`;
  }

  // re-upload under the same name makes the original newer than the variant
  private async isFresh(sourcePath: string, cachePath: string) {
    try {
      const [source, cached] = await Promise.all([fs.stat(sourcePath), fs.stat(cachePath)]);
      return cached.mtimeMs >= source.mtimeMs;
    } catch {
      return false;
    }
  }

  private async generate(sourcePath: string, cachePath: string, params: ImageParams) {
    await fs.mkdir(path.dirname(cachePath), { recursive: true });
    const tmpPath = `${cachePath}.${process.pid}.${Date.now()}.tmp`;
    try {
      let image = sharp(sourcePath).rotate();
      if (params.width || params.height) {
        image = image.resize({
          width: params.width,
          height: params.height,
          withoutEnlargement: true,
        });
      }
      await image.webp({ quality: params.quality }).toFile(tmpPath);
      await fs.rename(tmpPath, cachePath);
    } catch (e) {
      await fs.rm(tmpPath, { force: true });
      throw e;
    }
  }
}
