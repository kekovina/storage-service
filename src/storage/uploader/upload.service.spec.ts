import { UploaderService } from './upload.service';
import { HttpException, HttpStatus } from '@nestjs/common';
import { ERROR_CODES } from '@/consts';
import { Readable, Writable } from 'stream';
import fs from 'fs';

jest.spyOn(fs, 'createWriteStream').mockImplementation(() => {
  return new Writable({
    write(_chunk, _encoding, callback) {
      callback();
    },
  }) as any;
});

jest.mock('@/storage/libs/checkOrCreateCollectionExists', () => ({
  checkOrCreateCollectionExists: jest.fn(),
}));
import { checkOrCreateCollectionExists } from '@/storage/libs/checkOrCreateCollectionExists';

describe('UploaderService', () => {
  let service: UploaderService;

  beforeEach(() => {
    service = new UploaderService();
    jest.clearAllMocks();
  });

  const createFakePart = (fieldname: string, mimetype: string, fileContent = 'test') => {
    const stream = new Readable();
    stream.push(fileContent);
    stream.push(null);
    return {
      fieldname,
      mimetype,
      file: stream,
    };
  };

  it('success upload', async () => {
    (checkOrCreateCollectionExists as jest.Mock).mockResolvedValue(true);

    const parts = (async function* () {
      yield createFakePart('file.txt', 'text/plain');
    })();

    const result = await service.upload('/tmp', parts, ['text/plain']);

    expect(result.message).toBe('OK');
    expect(result.uploadedCount).toBe(1);
    expect(result.errorsCount).toBe(0);
    expect(result.files[0]).toMatch(/file\.txt$/);
  });

  it('wrong mimetype', async () => {
    (checkOrCreateCollectionExists as jest.Mock).mockResolvedValue(true);

    const parts = (async function* () {
      yield createFakePart('file.jpg', 'image/jpeg');
    })();

    const result = await service.upload('/tmp', parts, ['text/plain']);

    expect(result.uploadedCount).toBe(0);
    expect(result.errorsCount).toBe(1);
    expect(result.errors[0]).toMatch(/Mimetype not allowed/);
  });

  it('throw CREATE_COLLECTION_DIR_ERROR', async () => {
    (checkOrCreateCollectionExists as jest.Mock).mockResolvedValue(false);

    const parts = (async function* () {})();

    await expect(service.upload('/tmp', parts, ['text/plain'])).rejects.toThrow(
      new HttpException(
        {
          message: 'Could not create collection',
          code: ERROR_CODES.CREATE_COLLECTION_DIR_ERROR,
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    );
  });

  it('throw FILE_WRITE_ERROR', async () => {
    (checkOrCreateCollectionExists as jest.Mock).mockResolvedValue(true);

    const failingStream = new Readable({
      read() {
        this.emit('error', new Error('Disk full'));
      },
    });

    const parts = (async function* () {
      yield {
        fieldname: 'bad.txt',
        mimetype: 'text/plain',
        file: failingStream,
      };
    })();

    await expect(service.upload('/tmp', parts, ['text/plain'])).rejects.toThrow(
      new HttpException(
        {
          code: ERROR_CODES.FILE_WRITE_ERROR,
          message: 'Disk full',
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    );
  });
});
