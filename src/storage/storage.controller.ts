import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
  Res,
  UploadedFile,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';
import { BaseErrorResponseDto } from './types';
import { BearerAuthGuard } from '@/auth/bearer-auth-guard.guard';
import { HttpExceptionFilter } from '@/http-exception.filter';
import {
  DropCollectionParamsDto,
  GetCollectionFilesParamsDto,
  GetDeleteFileParamsDto,
  GetDownloadFileParamsDto,
  GetFileParamsDto,
  GetPreviewFileParamsDto,
  UploadFileOptionsDto,
  UploadFileParamsDto,
  UploadPhotoStorageDto,
} from './dto/request.dto';
import { StorageService } from './storage.service';
import {
  CollectionFilesListResponseDto,
  CollectionsListResponseDto,
  SuccessResponseDto,
  UploadFilesResponseDto,
} from './dto/response.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';

// revalidate via ETag/Last-Modified so a re-upload under the same name shows up at once
const FILE_CACHE_CONTROL = 'public, no-cache';

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
  @UseFilters(HttpExceptionFilter)
  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('/:collection')
  async create(
    @UploadedFile() file: Express.Multer.File,
    @Param() { collection }: UploadFileParamsDto,
    @Res() res: Response,
    @Body() opts: UploadFileOptionsDto
  ) {
    const result = await this.storageService.upload(collection, file, opts);
    return res.status(HttpStatus.CREATED).send(result);
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
  async findAll(@Param() { collection }: GetCollectionFilesParamsDto) {
    return {
      collectionName: collection,
      files: await this.storageService.getCollectionFiles(collection),
    };
  }

  @ApiOperation({ summary: 'Get file' })
  @ApiQuery({
    name: 'width',
    required: false,
    type: Number,
    description: 'Resize by width (ignored if height is set too)',
  })
  @ApiQuery({
    name: 'height',
    required: false,
    type: Number,
    description: 'Resize by height (ignored if width is set too)',
  })
  @ApiQuery({
    name: 'quality',
    required: false,
    type: Number,
    description: 'WebP quality 1-100, default 80',
  })
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
  async getFile(
    @Res() res: Response,
    @Param() { collection, filename }: GetFileParamsDto,
    @Query() query: Record<string, unknown>
  ) {
    const preparedFilename = decodeURIComponent(filename);
    const file = await this.storageService.getFileByQuery(collection, preparedFilename, query);
    return res.header('cache-control', FILE_CACHE_CONTROL).sendFile(file);
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
  getPreview(@Param() { collection, filename }: GetPreviewFileParamsDto, @Res() res: Response) {
    const file = this.storageService.getFile(collection, filename);
    return res.header('cache-control', FILE_CACHE_CONTROL).sendFile(file);
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
  download(@Param() { collection, filename }: GetDownloadFileParamsDto, @Res() res: Response) {
    const file = this.storageService.getFile(collection, filename);
    return res.header('Content-Disposition', `attachment; filename="${filename}"`).send(file);
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
  async remove(@Param() { collection, filename }: GetDeleteFileParamsDto, @Res() res: Response) {
    await this.storageService.dropFile(collection, filename);
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
  async dropCollection(@Param() { collection }: DropCollectionParamsDto, @Res() res: Response) {
    await this.storageService.dropCollection(collection);
    return res.status(HttpStatus.NO_CONTENT).send({ status: true });
  }
}
