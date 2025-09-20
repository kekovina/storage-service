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
import { UploadPhotoStorageDto, UploadFileOptionsDto } from './dto/request.dto';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { StorageService } from './storage.service';
import {
  CollectionFilesListResponseDto,
  CollectionsListResponseDto,
  SuccessResponseDto,
  UploadFilesResponseDto,
} from './dto/response.dto';

@ApiResponse({
  status: HttpStatus.UNAUTHORIZED,
  description: 'Unauthorized.',
  type: BaseErrorResponseDto,
})
@ApiResponse({
  status: HttpStatus.INTERNAL_SERVER_ERROR,
  description: 'Internal server error.',
  type: BaseErrorResponseDto,
})
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @ApiOperation({ summary: 'Upload file' })
  @ApiBody({ type: UploadPhotoStorageDto })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The file has/have been successfully uploaded.',
    type: UploadFilesResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'No one file has/have been uploaded.',
    type: UploadFilesResponseDto,
  })
  @UseFilters(HttpExceptionFilter)
  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @Post('/:collection')
  async create(
    @Req() req: FastifyRequest,
    @Param('collection') collection: string,
    @Res() res: FastifyReply,
    @Query() opts: UploadFileOptionsDto
  ) {
    const parts = req.files();
    const result = await this.storageService.upload(collection, parts, opts);
    const responseStatus = result.uploadedCount > 0 ? HttpStatus.CREATED : HttpStatus.BAD_REQUEST;
    return res.status(responseStatus).send(result);
  }

  @ApiOperation({ summary: 'Get list of collection`s files' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of files',
    type: CollectionFilesListResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection not found',
    type: BaseErrorResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get('/:collection')
  async findAll(@Param('collection') collection: string) {
    return {
      collectionName: collection,
      files: await this.storageService.getCollectionFiles(collection),
    };
  }

  @ApiOperation({ summary: 'Get list of collections' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'List of collections',
    type: CollectionsListResponseDto,
  })
  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get('/collections')
  async getAllCollections() {
    return {
      collections: await this.storageService.getAllCollections(),
    };
  }

  @ApiOperation({ summary: 'Get file' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
    type: BaseErrorResponseDto,
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
    type: BaseErrorResponseDto,
  })
  @UseFilters(HttpExceptionFilter)
  @Get('/:collection/:filename/preview')
  getPreview(@Param('collection') collection: string, @Param('filename') filename: string) {
    return this.storageService.getPreview(collection, filename);
  }

  @ApiOperation({ summary: 'Download file' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'File',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
    type: BaseErrorResponseDto,
  })
  @UseFilters(HttpExceptionFilter)
  @Get('/:collection/:filename/download')
  download(@Param('collection') collection: string, @Param('filename') filename: string) {
    return this.storageService.download(collection, filename);
  }

  //DELETE
  @ApiOperation({ summary: 'Delete file' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'File deleted',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'File not found',
    type: BaseErrorResponseDto,
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
    this.storageService.dropFile(collection, filename);
    return res.status(HttpStatus.NO_CONTENT).send({ status: true });
  }

  @ApiOperation({ summary: 'Delete collection' })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Collection deleted',
    type: SuccessResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Collection not found',
    type: BaseErrorResponseDto,
  })
  @ApiBearerAuth()
  @UseFilters(HttpExceptionFilter)
  @UseGuards(BearerAuthGuard)
  @Delete('/:collection')
  dropCollection(@Param('collection') collection: string, @Res() res: FastifyReply) {
    this.storageService.dropCollection(collection);
    return res.status(HttpStatus.NO_CONTENT).send({ status: true });
  }
}
