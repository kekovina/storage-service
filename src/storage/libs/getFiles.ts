import fs from 'fs/promises';
import { Dirent } from 'fs';

export const getFiles = async (source: string) => {
  try {
    return (await fs.readdir(source, { withFileTypes: true }))
      .filter((dirent: Dirent) => !dirent.isDirectory())
      .map((dirent: Dirent) => dirent.name);
  } catch (e) {
    return [];
  }
};
