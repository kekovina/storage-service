import { ERROR_CODES } from '@/consts';
import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponse {
  @ApiProperty({
    description: 'error message',
    example: 'Could not create collection',
  })
  message: string;

  @ApiProperty({ description: 'Error code', example: ERROR_CODES.CREATE_COLLECTION_DIR_ERROR })
  code: ERROR_CODES;
}

export class BaseErrorResponseDto {
  @ApiProperty({ description: 'HTTP code', example: 500 })
  status: number;

  @ApiProperty({ description: 'Timestamp', example: new Date().toISOString() })
  timestamp: number;

  @ApiProperty({ description: 'Request path', example: '/' })
  path: string;

  @ApiProperty({ description: 'Error response', type: ErrorResponse })
  response: ErrorResponse;
}
