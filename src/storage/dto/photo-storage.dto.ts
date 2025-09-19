import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, Max, Min, ValidateIf } from 'class-validator';

export class UploadPhotoStorageDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string', format: 'binary' },
    required: true,
    description: 'Files to upload',
  })
  files: File[];
}

export class UploadPhotoQueryDto {
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ default: false, example: true, description: 'Convert to webp', required: false })
  optimize?: boolean;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({ default: false, example: true, description: 'Create preview', required: false })
  preview?: boolean;

  @Type(() => Number)
  @ValidateIf((o) => o.preview === true)
  @IsOptional()
  @IsNumber()
  @Min(30)
  @Max(99)
  @ApiProperty({
    default: 99,
    example: 80,
    description: 'Preview size',
    required: false,
    minimum: 30,
    maximum: 99,
  })
  previewSize?: number;
}
