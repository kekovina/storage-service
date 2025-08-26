import { ERROR_CODES } from '@/consts';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ description: 'HTTP code', example: 500 })
  statusCode: number;

  @ApiProperty({
    description: 'error message',
    example: 'Could not create collection',
  })
  message: string;

  @ApiProperty({ description: 'Error code', example: ERROR_CODES.CREATE_COLLECTION_DIR_ERROR })
  code: ERROR_CODES;
}
