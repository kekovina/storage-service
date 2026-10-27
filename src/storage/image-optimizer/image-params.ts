export type ImageLimits = { minSize: number; maxSize: number };

export type ImageParams = { width?: number; height?: number; quality: number };

export const DEFAULT_QUALITY = 80;

const toPositiveInt = (value: unknown) =>
  typeof value === 'string' && /^\d+$/.test(value) && Number(value) > 0 ? Number(value) : undefined;

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

/**
 * Query -> normalized params. `null` = serve the original file.
 * Invalid values are ignored; width + height together are not supported.
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
    width: width && clamp(width, minSize, maxSize),
    height: height && clamp(height, minSize, maxSize),
    quality: quality ? clamp(quality, 1, 100) : DEFAULT_QUALITY,
  };
}
