import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Document, DocumentType } from '../entities/document.entity';
import { UserRole } from '../entities/user.entity';
import { CloudinaryService } from '../common/cloudinary/cloudinary.service';
import { AuditLogService } from '../common/audit-log/audit-log.service';

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/jpg',
  'application/pdf',
];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export interface DocumentAssociationInput {
  uploadCategory?: string;
  ownerResource?: string;
  ownerResourceId?: string;
  purpose?: string;
  correlationId?: string;
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectRepository(Document)
    private readonly documentRepository: Repository<Document>,
    private readonly cloudinaryService: CloudinaryService,
    private readonly auditLogService: AuditLogService,
  ) {}

  async upload(
    userId: string,
    file: Express.Multer.File,
    type: DocumentType,
    listingId?: string,
    association?: DocumentAssociationInput,
  ): Promise<Document> {
    return this.uploadBuffer(userId, {
      buffer: file.buffer,
      mimetype: file.mimetype,
      size: file.size,
      originalname: file.originalname,
      type,
      listingId,
      metadata: this.buildAssociationMetadata(association),
    });
  }

  async uploadBase64(
    userId: string,
    input: {
      name: string;
      url: string;
      type: DocumentType;
      listingId?: string;
      metadata?: Record<string, unknown>;
    },
  ): Promise<Document> {
    const match = input.url.match(/^data:([^;]+);base64,(.+)$/);
    if (!match) {
      throw new BadRequestException('Invalid base64 document payload.');
    }

    const [, mimetype, data] = match;
    const buffer = Buffer.from(data, 'base64');
    return this.uploadBuffer(userId, {
      buffer,
      mimetype,
      size: buffer.length,
      originalname: input.name,
      type: input.type,
      listingId: input.listingId,
      metadata: input.metadata,
    });
  }

  private buildAssociationMetadata(
    association?: DocumentAssociationInput,
  ): Record<string, unknown> | undefined {
    if (!association) return undefined;
    return Object.fromEntries(
      Object.entries({
        uploadCategory: association.uploadCategory,
        ownerResource: association.ownerResource,
        ownerResourceId: association.ownerResourceId,
        purpose: association.purpose,
        correlationId: association.correlationId,
      }).filter(([, value]) => Boolean(value)),
    );
  }

  private async uploadBuffer(
    userId: string,
    file: {
      buffer: Buffer;
      mimetype: string;
      size: number;
      originalname: string;
      type: DocumentType;
      listingId?: string;
      metadata?: Record<string, unknown>;
    },
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

    const uploadResult = await this.cloudinaryService.uploadBuffer({
      buffer: file.buffer,
      fileName: file.originalname,
      contentType: file.mimetype,
      folder: `miners-hub/documents/${userId}`,
    });

    // Persist document record
    const document = this.documentRepository.create({
      userId,
      type: file.type,
      listingId: file.listingId ?? null,
      fileName: file.originalname,
      fileUrl: uploadResult.secureUrl,
      fileSize: uploadResult.bytes || file.size,
      mimeType: file.mimetype,
      metadata: {
        ...(file.metadata || {}),
        storageProvider: 'cloudinary',
        storageIdentity: uploadResult.publicId,
        cloudinaryPublicId: uploadResult.publicId,
        cloudinaryResourceType: uploadResult.resourceType,
        cloudinaryFormat: uploadResult.format,
        width: uploadResult.width,
        height: uploadResult.height,
      },
    });

    const saved = await this.documentRepository.save(document);
    this.auditLogService.log({
      userId,
      action: 'document.upload',
      resource: 'document',
      resourceId: saved.id,
      metadata: {
        type: saved.type,
        listingId: saved.listingId,
        fileName: saved.fileName,
        mimeType: saved.mimeType,
        fileSize: saved.fileSize,
      },
    });
    return saved;
  }

  async findOne(id: string, userId: string, role: UserRole): Promise<Document> {
    const doc = await this.documentRepository.findOne({ where: { id } });
    if (!doc) throw new NotFoundException('Document not found.');
    if (doc.metadata?.deletedAt)
      throw new NotFoundException('Document not found.');
    if (role !== UserRole.ADMIN && doc.userId !== userId) {
      throw new ForbiddenException('Access denied.');
    }
    return doc;
  }

  async findByUser(userId: string): Promise<Document[]> {
    return this.documentRepository
      .createQueryBuilder('document')
      .where('document.userId = :userId', { userId })
      .andWhere("(document.metadata->>'deletedAt' IS NULL)")
      .orderBy('document.createdAt', 'DESC')
      .getMany();
  }

  async remove(id: string, userId: string, role: UserRole): Promise<void> {
    const doc = await this.findOne(id, userId, role);

    doc.metadata = {
      ...(doc.metadata || {}),
      deletedAt: new Date().toISOString(),
      deletedBy: userId,
    };
    await this.documentRepository.save(doc);
    this.auditLogService.log({
      userId,
      action: 'document.delete',
      resource: 'document',
      resourceId: doc.id,
      metadata: {
        ownerId: doc.userId,
        type: doc.type,
        listingId: doc.listingId,
        deletedByRole: role,
      },
    });
  }
}
