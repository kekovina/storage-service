import { ERROR_CODES } from '@/consts';
import { MultipartFile } from '@fastify/multipart';

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
  process(file: MultipartFile): Promise<FilePrepareStatus>;
  process(file: MultipartFile, options?: FilePrepareOptions): Promise<FilePrepareStatus>;
}
