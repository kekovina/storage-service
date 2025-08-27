import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional, Max, Min, ValidateIf } from 'class-validator';

export class UploadPhotoStorageDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    description: 'Files to upload',
  })
  files: any[];

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ default: false, example: true, description: 'Create preview' })
  preview?: boolean;

  @ValidateIf((o) => o.preview === true)
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(99)
  @ApiProperty({ default: 99, example: 80, description: 'Preview size' })
  previewSize?: number;
}
