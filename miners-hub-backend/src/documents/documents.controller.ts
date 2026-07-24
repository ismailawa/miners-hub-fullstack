import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  ParseUUIDPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { DocumentsService } from './documents.service';
import { UploadDocumentDto } from './documents.dto';
import { DocumentType } from '../entities/document.entity';

@Controller('documents')
@UseGuards(JwtAuthGuard)
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * POST /api/documents/upload
   * Upload a file to Cloudinary and record it in the database.
   * Accepts multipart/form-data with fields: file, type, listingId (optional).
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(), // Keep in memory; we stream directly to Cloudinary
      limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB hard limit at transport layer
    }),
  )
  async upload(
    @UploadedFile() file: Express.Multer.File,
    @Body() dto: UploadDocumentDto,
    @Request() req: any,
  ) {
    return this.documentsService.upload(
      req.user.id,
      file,
      dto.type,
      dto.listingId,
      {
        uploadCategory: dto.uploadCategory,
        ownerResource: dto.ownerResource,
        ownerResourceId: dto.ownerResourceId,
        purpose: dto.purpose,
        correlationId: dto.correlationId,
      },
    );
  }

  /**
   * GET /api/documents
   * List all documents belonging to the current user.
   */
  @Get()
  async findMyDocuments(@Request() req: any) {
    return this.documentsService.findByUser(req.user.id);
  }

  /**
   * GET /api/documents/:id
   * Retrieve a single document (owner or admin).
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    return this.documentsService.findOne(id, req.user.id, req.user.role);
  }

  /**
   * DELETE /api/documents/:id
   * Soft-delete a document record (owner or admin).
   */
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @Request() req: any) {
    await this.documentsService.remove(id, req.user.id, req.user.role);
    return { success: true, message: 'Document deleted.' };
  }
}
