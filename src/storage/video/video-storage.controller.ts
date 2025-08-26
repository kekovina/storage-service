import { Controller, Get, Post, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { VideoStorageService } from './video-storage.service';
import { type FastifyRequest } from 'fastify';
import { BearerAuthGuard } from '@/auth/bearer-auth-guard.guard';

@Controller('storage/video')
export class VideoStorageController {
  constructor(private readonly videoStorageService: VideoStorageService) {}

  @UseGuards(BearerAuthGuard)
  @Post('/:collection')
  async create(@Req() req: FastifyRequest, @Param('collection') collection: string) {
    const parts = req.files();
    return this.videoStorageService.upload(collection, parts);
  }

  @Get()
  findAll() {
    return this.videoStorageService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.videoStorageService.findOne(+id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.videoStorageService.remove(+id);
  }
}
