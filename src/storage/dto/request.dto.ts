import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

export class UploadDefaultOptionsDto {
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    default: false,
    example: true,
    description: 'Keep original filename',
    required: false,
  })
  keepOriginalFilename?: boolean;
}

export class UploadVideoOptionsDto {
  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    default: false,
    example: true,
    description: 'Optimize video (convert GIF to WebM)',
    required: false,
  })
  optimize?: boolean;

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    default: false,
    example: true,
    description: 'Keep original filename',
    required: false,
  })
  keepOriginalFilename?: boolean;
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

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    default: false,
    example: true,
    description: 'Keep original filename',
    required: false,
  })
  keepOriginalFilename?: boolean;
}

export class UploadPhotoStorageDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    required: true,
    description: 'File to upload',
  })
  file: Express.Multer.File;

  @ApiProperty({
    type: 'object',
    description: 'Photo options',
    properties: {
      optimize: { type: 'boolean', default: false, description: 'Convert to webp' },
      preview: { type: 'boolean', default: false, description: 'Create preview' },
      previewSize: {
        type: 'number',
        default: 99,
        minimum: 30,
        maximum: 99,
        description: 'Preview size',
      },
      keepOriginalFilename: {
        type: 'boolean',
        default: false,
        description: 'Keep original filename',
      },
    },
  })
  photo?: UploadPhotoOptionsDto;

  @ApiProperty({
    type: 'object',
    description: 'Video options',
    properties: {
      optimize: {
        type: 'boolean',
        default: false,
        description: 'Optimize video (convert GIF to WebM)',
      },
      keepOriginalFilename: {
        type: 'boolean',
        default: false,
        description: 'Keep original filename',
      },
    },
  })
  video?: UploadVideoOptionsDto;

  @ApiProperty({
    type: 'object',
    description: 'Default options (for other file types)',
    properties: {
      keepOriginalFilename: {
        type: 'boolean',
        default: false,
        description: 'Keep original filename',
      },
    },
  })
  default?: UploadDefaultOptionsDto;

  @ApiProperty({
    type: 'boolean',
    required: false,
    default: false,
    description: 'Keep original filename for all file types',
  })
  keepOriginalFilename?: boolean;
}

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

  @Type(() => Boolean)
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    default: false,
    example: true,
    description: 'Keep original filename for all file types',
    required: false,
  })
  keepOriginalFilename?: boolean;
}

export class GetCollectionFilesParamsDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Collection name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Collection name is required' })
  @Matches(/^[^/.]+$/, {
    message: 'Collection name is invalid',
  })
  collection: string;
}

export class GetFileParamsDto {
  @ApiProperty({
    type: String,
    required: true,
    description: 'Collection name',
  })
  @IsString()
  @IsNotEmpty({ message: 'Collection name is required' })
  @Matches(/^[^/.]+$/, {
    message: 'Collection name is invalid',
  })
  collection: string;
  @ApiProperty({
    type: String,
    required: true,
    description: 'File name',
  })
  @IsNotEmpty({ message: 'File name is required' })
  @IsString()
  filename: string;
}

export class GetPreviewFileParamsDto extends GetFileParamsDto {}
export class GetDownloadFileParamsDto extends GetFileParamsDto {}
export class GetDeleteFileParamsDto extends GetFileParamsDto {}

export class UploadFileParamsDto extends GetCollectionFilesParamsDto {}
export class DropCollectionParamsDto extends GetCollectionFilesParamsDto {}
