import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { Readable } from 'stream';

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  resourceType: string;
  bytes: number;
  format?: string;
  width?: number;
  height?: number;
}

@Injectable()
export class CloudinaryService {
  constructor(private readonly configService: ConfigService) {
    cloudinary.config({
      cloud_name: this.requiredConfig('CLOUDINARY_CLOUD_NAME'),
      api_key: this.requiredConfig('CLOUDINARY_API_KEY'),
      api_secret: this.requiredConfig('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  uploadBuffer(input: {
    buffer: Buffer;
    folder: string;
    fileName: string;
    contentType: string;
  }): Promise<CloudinaryUploadResult> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: input.folder,
          public_id: this.toPublicId(input.fileName),
          resource_type: 'auto',
          overwrite: false,
          use_filename: true,
          unique_filename: true,
          context: {
            original_filename: input.fileName,
            content_type: input.contentType,
          },
        },
        (error, result) => {
          if (error) {
            reject(new Error(this.getUploadErrorMessage(error)));
            return;
          }
          if (!result) {
            reject(new Error('Cloudinary upload returned no result.'));
            return;
          }
          resolve(this.toUploadResult(result));
        },
      );

      Readable.from(input.buffer).pipe(uploadStream);
    });
  }

  private toUploadResult(result: UploadApiResponse): CloudinaryUploadResult {
    return {
      secureUrl: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type,
      bytes: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
    };
  }

  private getUploadErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;
    if (
      typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string'
    ) {
      return error.message;
    }
    return 'Cloudinary upload failed.';
  }

  private toPublicId(fileName: string): string {
    return fileName
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80);
  }

  private requiredConfig(key: string): string {
    const value = this.configService.get<string>(key);
    if (!value) {
      throw new ServiceUnavailableException(`${key} is not configured.`);
    }
    return value;
  }
}
