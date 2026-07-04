import { BadRequestException, Injectable } from '@nestjs/common';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];
const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export type MediaUploadContext = 'profile' | 'listing' | 'event' | 'general';

@Injectable()
export class MediaService {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

  async uploadImage(
    userId: string,
    file: Express.Multer.File,
    context: MediaUploadContext = 'general',
  ) {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPG and PNG images are allowed.');
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new BadRequestException('Image is too large. Maximum size is 10 MB.');
    }

    const safeContext: MediaUploadContext = [
      'profile',
      'listing',
      'event',
      'general',
    ].includes(context)
      ? context
      : 'general';

    return this.cloudinaryService.uploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
      folder: `miners-hub/images/${safeContext}/${userId}`,
    });
  }
}
