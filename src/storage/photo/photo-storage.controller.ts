import {
  Controller,
  Get,
  Post,
  Param,
  Delete,
  UseGuards,
  Req,
  Res,
  UseFilters,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { PhotoStorageService } from './photo-storage.service';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { BearerAuthGuard } from '@/auth/bearer-auth-guard.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { UploadPhotoQueryDto, UploadPhotoStorageDto } from './dto/photo-storage.dto';
import { HttpExceptionFilter } from '@/http-exception.filter';
import { BaseErrorResponseDto } from '@/storage/types';

@ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: 'Unauthorized.' })
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error.',
  type: BaseErrorResponseDto,
})
@Controller('storage/photo')
export class PhotoStorageController {
  constructor(private readonly photoStorageService: PhotoStorageService) {}

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
    const response = await this.photoStorageService.upload(collection, parts, opts);
    if (response.message === 'OK') res.status(HttpStatus.CREATED).send(response);
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
    return this.photoStorageService.getCollectionFiles(collection);
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
    return this.photoStorageService.getAllCollections();
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
    const file = this.photoStorageService.getFile(collection, filename);
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
    return this.photoStorageService.getPreview(collection, filename);
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
    if (this.photoStorageService.dropFile(collection, filename) === undefined)
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
    if (this.photoStorageService.dropCollection(collection) === undefined)
      return res.status(HttpStatus.NO_CONTENT);
  }
}
