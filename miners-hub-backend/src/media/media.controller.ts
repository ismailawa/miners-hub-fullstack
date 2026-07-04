import {
  BadRequestException,
  Body,
  Controller,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { MediaService, MediaUploadContext } from './media.service';

@Controller('media')
@UseGuards(JwtAuthGuard)
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  upload(
    @UploadedFile() file: Express.Multer.File,
    @Body('context') context: MediaUploadContext | undefined,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Image file is required.');
    }

    return this.mediaService.uploadImage(req.user.id, file, context);
  }
}
