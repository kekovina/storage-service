import { ERROR_CODES } from '@/consts';

export type PhotoHandlerOptions = {
  optimize?: boolean;
  preview?: boolean;
  previewSize?: number;
  keepOriginalFilename?: boolean;
};

export type VideoHandlerOptions = {
  optimize?: boolean;
  keepOriginalFilename?: boolean;
};

export type FilePrepareStatusFailed = {
  isPrepared: false;
  error: {
    code: ERROR_CODES;
    message: string;
  };
};

export type File = {
  buffer: Buffer;
  filename: string;
};

export type FilePrepareStatusSuccess = {
  isPrepared: true;
  file: File;
  preview?: File;
};

export type FilePrepareStatus = FilePrepareStatusFailed | FilePrepareStatusSuccess;

export type FilePrepareOptions = PhotoHandlerOptions | VideoHandlerOptions;

export interface FileHandler {
  process(file: Express.Multer.File): Promise<FilePrepareStatus>;
  process(file: Express.Multer.File, options?: FilePrepareOptions): Promise<FilePrepareStatus>;
}
