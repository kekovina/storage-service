import path from 'node:path';

export const ROOT_PATH = process.cwd();

export const FOLDER_PATH = path.join(ROOT_PATH, 'uploads');

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const AVAILABLE_PHOTO_MIMETYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const AVAILABLE_VIDEO_MIMETYPES = ['video/mp4', 'video/webm', 'video/ogg'];
export const AVAILABLE_APPLICATION_MIMETYPES = ['application/pdf'];

export const AVAILABLE_MIMETYPES = [
  ...AVAILABLE_PHOTO_MIMETYPES,
  ...AVAILABLE_VIDEO_MIMETYPES,
  ...AVAILABLE_APPLICATION_MIMETYPES,
];
