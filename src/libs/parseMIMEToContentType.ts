import { CONTENT_TYPES } from '@/consts';

export function parseMIMEToContentType(mime: string): CONTENT_TYPES {
  switch (mime) {
    case 'image/png':
    case 'image/jpeg':
    case 'image/webp':
    case 'image/svg+xml':
    case 'image/bmp':
    case 'image/tiff':
      return CONTENT_TYPES.PHOTO;
    case 'video/mp4':
    case 'video/webm':
    case 'video/ogg':
    case 'image/gif':
      return CONTENT_TYPES.VIDEO;
    default:
      return CONTENT_TYPES.DEFAULT;
  }
}
