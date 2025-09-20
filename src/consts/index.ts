export enum ERROR_CODES {
  CREATE_COLLECTION_DIR_ERROR = 'CREATE_COLLECTION_DIR_ERROR',
  FILE_WRITE_ERROR = 'FILE_WRITE_ERROR',
  DIR_READ_ERROR = 'DIR_READ_ERROR',
  FILE_DELETE_ERROR = 'FILE_DELETE_ERROR',
  COLLECTION_DELETE_ERROR = 'COLLECTION_DELETE_ERROR',
  FILE_READ_ERROR = 'FILE_READ_ERROR',
  COLLECTION_NOT_FOUND = 'COLLECTION_NOT_FOUND',
  FILE_NOT_FOUND = 'FILE_NOT_FOUND',
  FILE_PREPARE_ERROR = 'FILE_PREPARE_ERROR',
}

export enum CONTENT_TYPES {
  PHOTO = 'photo',
  VIDEO = 'video',
  DEFAULT = 'default',
}

export const supportedMimeTypes = [
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'video/mp4',
  'video/webm',
  'video/ogg',
];
