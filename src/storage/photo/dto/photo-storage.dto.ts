import { ApiProperty } from '@nestjs/swagger';

export class UploadPhotoStorageDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Files to upload',
  })
  files: any[];
}
