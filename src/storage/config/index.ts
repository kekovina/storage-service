import path from 'node:path';

export const FOLDER_PATH = path.join(__dirname, '..', 'uploads');
export const PHOTO_FOLDER = path.join(FOLDER_PATH, 'photo');
export const VIDEO_FOLDER = path.join(FOLDER_PATH, 'video');
export const PHOTO_PREVIEW_FOLDER = path.join(FOLDER_PATH, 'photo', 'preview');
export const VIDEO_PREVIEW_FOLDER = path.join(FOLDER_PATH, 'video', 'preview');
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const AVAILABLE_PHOTO_MIMETYPES = [
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

export const AVAILABLE_VIDEO_MIMETYPES = ['video/mp4', 'video/webm', 'video/ogg'];
