import { ERROR_CODES } from '@/consts';

export type PhotoHandlerOptions = {
  optimize?: boolean;
  preview?: boolean;
  previewSize?: number;
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

export type FilePrepareOptions = PhotoHandlerOptions;

export interface FileHandler {
  process(file: Express.Multer.File): Promise<FilePrepareStatus>;
  process(file: Express.Multer.File, options?: FilePrepareOptions): Promise<FilePrepareStatus>;
}
