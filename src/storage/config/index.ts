import path from 'node:path';

export const ROOT_PATH = process.cwd();

export const FOLDER_PATH = path.join(ROOT_PATH, 'uploads');

export const CACHE_FOLDER_PATH = path.join(ROOT_PATH, 'cache');
