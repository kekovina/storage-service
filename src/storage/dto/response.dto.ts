import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNumber, IsString } from 'class-validator';

export class UploadFilesResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  status: boolean;
  @ApiProperty({ example: 3 })
  @IsNumber()
  uploadedCount: number;
  @ApiProperty({ example: 1 })
  @IsNumber()
  errorsCount: number;
  @ApiProperty({ type: 'array', items: { type: 'string' }, example: ['file1', 'file2'] })
  @IsArray()
  files: string[];
  @ApiProperty({
    type: 'object',
    example: { file1: 'error1', file2: 'error2' },
    additionalProperties: { type: 'string' },
  })
  @IsArray()
  errors: Record<string, string>[];
}

export class SuccessResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  status: boolean;
}

export class CollectionsListResponseDto {
  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['collection1', 'collection2'],
  })
  @IsArray()
  collections: string[];
}

export class CollectionFilesListResponseDto {
  @ApiProperty({ example: 'collection1' })
  @IsString()
  collectionName: string;

  @ApiProperty({
    type: 'array',
    items: { type: 'string' },
    example: ['file1', 'file2'],
  })
  @IsArray()
  files: string[];
}
