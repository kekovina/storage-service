import path from 'node:path';

export const ROOT_PATH = process.cwd();

export const FOLDER_PATH = path.join(ROOT_PATH, 'uploads');
export const PHOTO_FOLDER = path.join(FOLDER_PATH, 'photo');
export const VIDEO_FOLDER = path.join(FOLDER_PATH, 'video');
export const DEFAULT_FOLDER = path.join(FOLDER_PATH, 'default');
export const PHOTO_PREVIEW_FOLDER = path.join(FOLDER_PATH, 'preview', 'photo');
export const VIDEO_PREVIEW_FOLDER = path.join(FOLDER_PATH, 'preview', 'video');
export const DEFAULT_PREVIEW_FOLDER = path.join(FOLDER_PATH, 'preview', 'default');
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
