import { Controller, Get, Post, Param, Delete, UseGuards, Req, Res } from '@nestjs/common';
import { PhotoStorageService } from './photo-storage.service';
import { type FastifyRequest, type FastifyReply } from 'fastify';
import { BearerAuthGuard } from '@/auth/bearer-auth-guard.guard';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiResponse } from '@nestjs/swagger';
import { UploadPhotoStorageDto } from './dto/photo-storage.dto';
import { ErrorResponseDto } from './dto/response.dto';

@Controller('storage/photo')
export class PhotoStorageController {
  constructor(private readonly photoStorageService: PhotoStorageService) {}

  @UseGuards(BearerAuthGuard)
  @ApiBody({ description: 'Photo upload', type: UploadPhotoStorageDto })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({
    status: 201,
    description: 'The photo/photos has/have been successfully uploaded.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiResponse({
    status: 500,
    description: 'Internal server error.',
    type: ErrorResponseDto,
  })
  @Post('/:collection')
  async create(
    @Req() req: FastifyRequest,
    @Param('collection') collection: string,
    @Res() res: FastifyReply
  ) {
    try {
      const parts = req.files();
      const response = await this.photoStorageService.upload(collection, parts);
      if (response.message === 'OK') res.status(201).send(response);
    } catch (e) {
      throw e;
    }
  }

  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @Delete('/:collection/:filename')
  remove(@Param('collection') collection: string, @Param('filename') filename: string) {
    return this.photoStorageService.remove(collection, filename);
  }

  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @Get('/drop/:collection')
  dropCollection(@Param('collection') collection: string) {
    return this.photoStorageService.dropCollection(collection);
  }

  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @Get('/:collection')
  findAll(@Param('collection') collection: string) {
    return this.photoStorageService.findAll(collection);
  }

  @ApiBearerAuth()
  @UseGuards(BearerAuthGuard)
  @Get('/collections')
  getAllCollections(@Param('collections') collections: string) {
    return this.photoStorageService.getAllCollections(collections);
  }

  @Get('/:collection/:filename')
  getFile(@Param('collection') collection: string, @Param('filename') filename: string) {
    return this.photoStorageService.getFile(collection, filename);
  }

  @Get('/:collection/:filename/preview')
  getPreview(@Param('collection') collection: string, @Param('filename') filename: string) {
    return this.photoStorageService.getPreview(collection, filename);
  }
}
