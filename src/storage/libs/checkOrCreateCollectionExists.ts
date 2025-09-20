import fs from 'node:fs/promises';
export const checkOrCreateCollectionExists = async (collectionPath: string) => {
  try {
    await fs.access(collectionPath, fs.constants.R_OK | fs.constants.W_OK);
  } catch {
    await fs.mkdir(collectionPath, { recursive: true });
  }
  return true;
};
