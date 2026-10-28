export type ImageLimits = { minSize: number; maxSize: number };

export type ImageParams = { width?: number; height?: number; quality: number };

export const DEFAULT_QUALITY = 80;

// snapping bounds the number of cached variants per file (anyone can request any value)
const SIZE_STEP = 32;
const QUALITY_STEP = 10;

const toPositiveInt = (value: unknown) =>
  typeof value === 'string' && /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : undefined;

const snapUp = (value: number, step: number) => Math.ceil(value / step) * step;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Query -> normalized params. `null` = serve the original file.
 * Invalid values are ignored; width + height together are not supported.
 * Size is snapped up to SIZE_STEP, quality to QUALITY_STEP.
 */
export function normalizeImageParams(
  query: Record<string, unknown>,
  { minSize, maxSize }: ImageLimits
): ImageParams | null {
  const width = toPositiveInt(query.width);
  const height = toPositiveInt(query.height);
  const quality = toPositiveInt(query.quality);

  if (width && height) return null;
  if (!width && !height && !quality) return null;

  return {
    width: width && clamp(snapUp(width, SIZE_STEP), minSize, maxSize),
    height: height && clamp(snapUp(height, SIZE_STEP), minSize, maxSize),
    quality: quality
      ? clamp(Math.round(quality / QUALITY_STEP) * QUALITY_STEP, QUALITY_STEP, 100)
      : DEFAULT_QUALITY,
  };
}
