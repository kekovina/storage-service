import {
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { BaseErrorResponseDto } from './types';
import { BearerAuthGuard } from '@/auth/bearer-auth-guard.guard';
import { HttpExceptionFilter } from '@/http-exception.filter';
import { UploadPhotoStorageDto, UploadPhotoQueryDto } from './dto/photo-storage.dto';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { StorageService } from './storage.service';

@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error.',
  type: BaseErrorResponseDto,
})
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @ApiOperation({ summary: 'Upload photo' })
  @ApiBody({ type: UploadPhotoStorageDto })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The photo/photos has/have been successfully uploaded.',
  })
  @UseFilters(HttpExceptionFilter)
  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @Post('/:collection')
  async create(
    @Req() req: FastifyRequest,
    @Param('collection') collection: string,
    @Res() res: FastifyReply,
    @Query() opts: UploadPhotoQueryDto
  ) {
    const parts = req.files();
  }
  @ApiOperation({ summary: 'Get list of collection`s files' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of files',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection not found',
  })
  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get('/:collection')
  findAll(@Param('collection') collection: string) {
    return this.storageService.getCollectionFiles(collection);
  }

  @ApiOperation({ summary: 'Get list of collections' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of collections',
  })
  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get('/collections')
  getAllCollections() {
    return this.storageService.getAllCollections();
  }

  @ApiOperation({ summary: 'Get file' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
  })
  @UseFilters(HttpExceptionFilter)
  @Get('/:collection/:filename')
  getFile(
    @Res() reply: FastifyReply,
    @Param('collection') collection: string,
    @Param('filename') filename: string
  ) {
    const file = this.storageService.getFile(collection, filename);
    return reply
      .header('cache-control', 'public, max-age=31536000')
      .header('Content-Disposition', `attachment; filename="${file.filename}"`)
      .send(file.stream);
  }

  @ApiOperation({ summary: 'Get preview file' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
  })
  @UseFilters(HttpExceptionFilter)
  @Get('/:collection/:filename/preview')
  getPreview(@Param('collection') collection: string, @Param('filename') filename: string) {
    return this.storageService.getPreview(collection, filename);
  }

  //DELETE
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'File deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
  })
  @ApiBearerAuth()
  @UseFilters(HttpExceptionFilter)
  @UseGuards(BearerAuthGuard)
  @Delete('/:collection/:filename')
  remove(
    @Param('collection') collection: string,
    @Res() res: FastifyReply,
    @Param('filename') filename: string
  ) {
    if (this.storageService.dropFile(collection, filename) === undefined)
      return res.status(HttpStatus.NO_CONTENT);
  }

  @ApiOperation({ summary: 'Delete collection' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Collection deleted',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection not found',
  })
  @ApiBearerAuth()
  @UseFilters(HttpExceptionFilter)
  @UseGuards(BearerAuthGuard)
  @Delete('/:collection')
  dropCollection(@Param('collection') collection: string, @Res() res: FastifyReply) {
    if (this.storageService.dropCollection(collection) === undefined)
      return res.status(HttpStatus.NO_CONTENT);
  }
}
