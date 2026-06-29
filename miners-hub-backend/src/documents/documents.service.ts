import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { createClient } from '@supabase/supabase-js';
import { ConfigService } from '@nestjs/config';
import { Document, DocumentType } from '../entities/document.entity';
import { UserRole } from '../entities/user.entity';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const STORAGE_BUCKET = 'documents';

@Injectable()
export class DocumentsService {
  private supabase;

  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly configService: ConfigService,
  ) {
    this.supabase = createClient(
      this.configService.get<string>('SUPABASE_URL')!,
      this.configService.get<string>('SUPABASE_SERVICE_KEY')!,
    );
  }

  async upload(
    userId: string,
    file: Express.Multer.File,
    type: DocumentType,
    listingId?: string,
  ): Promise<Document> {
    // Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed: JPEG, PNG, PDF.`,
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(`File too large. Maximum size is 10 MB.`);
    }

    // Build storage path: documents/{userId}/{timestamp}-{filename}
    const storagePath = `${userId}/${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;

    // Upload to Supabase Storage
    const { data, error } = await this.supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(
        `File upload failed: ${error.message}`,
      );
    }

    // Get public URL
    const { data: urlData } = this.supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(data.path);

    // Persist document record
    const document = this.documentRepository.create({
      userId,
      type,
      listingId: listingId ?? null,
      fileName: file.originalname,
      fileUrl: urlData.publicUrl,
      fileSize: file.size,
      mimeType: file.mimetype,
      metadata: { storagePath: data.path },
    });

    return this.documentRepository.save(document);
  }

  async findOne(id: string, userId: string, role: UserRole): Promise<Document> {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found.');
    if (role !== UserRole.ADMIN && doc.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    return doc;
  }

  async findByUser(userId: string): Promise<Document[]> {
    return this.documentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string, role: UserRole): Promise<void> {
    const doc = await this.findOne(id, userId, role);

    // Remove from Supabase Storage
    if (doc.metadata?.storagePath) {
      await this.supabase.storage
        .from(STORAGE_BUCKET)
        .remove([doc.metadata.storagePath as string]);
    }

    await this.documentRepository.remove(doc);
  }
}
