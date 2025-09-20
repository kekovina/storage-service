import path from 'node:path';

export const ROOT_PATH = process.cwd();

export const FOLDER_PATH = path.join(ROOT_PATH, 'uploads');

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
