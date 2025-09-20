import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class UploadPhotoStorageDto {
  @ApiProperty({
    type: Blob,
    required: true,
    description: 'File to upload',
  })
  file: File;
}
export class UploadPhotoOptionsDto {
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

export class UploadVideoOptionsDto {}

export class UploadDefaultOptionsDto {}

export class UploadFileOptionsDto {
  @ValidateNested()
  @Type(() => UploadPhotoOptionsDto)
  @IsOptional()
  photo?: UploadPhotoOptionsDto;

  @ValidateNested()
  @Type(() => UploadVideoOptionsDto)
  @IsOptional()
  video?: UploadVideoOptionsDto;

  @ValidateNested()
  @Type(() => UploadDefaultOptionsDto)
  @IsOptional()
  default?: UploadDefaultOptionsDto;
}
