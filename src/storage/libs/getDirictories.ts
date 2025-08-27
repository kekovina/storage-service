import { Dirent } from 'fs';
import fs from 'fs/promises';

export const getDirectories = async (source: string) => {
  return (await fs.readdir(source, { withFileTypes: true }))
    .filter((dirent: Dirent) => dirent.isDirectory())
    .map((dirent: Dirent) => dirent.name);
};
