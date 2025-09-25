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
  @Matches(/^[A-z0-9\-]+\.[A-z0-9]+$/, {
    message: 'File name is invalid',
  })
  filename: string;
}

export class GetPreviewFileParamsDto extends GetFileParamsDto {}
export class GetDownloadFileParamsDto extends GetFileParamsDto {}
export class GetDeleteFileParamsDto extends GetFileParamsDto {}

export class UploadFileParamsDto extends GetCollectionFilesParamsDto {}
export class DropCollectionParamsDto extends GetCollectionFilesParamsDto {}
