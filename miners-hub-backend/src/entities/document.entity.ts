import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsEnum,
  IsOptional,
  IsJSON,
} from 'class-validator';
import { User } from './user.entity';
import { Listing } from './listing.entity';

export enum DocumentType {
  KYC = 'kyc',
  MINING_LICENCE = 'mining_licence',
  LISTING_ATTACHMENT = 'listing_attachment',
  CONTRACT = 'contract',
  OTHER = 'other',
}

@Entity('documents')
@Index(['userId'])
@Index(['listingId'])
@Index(['type'])
@Index(['createdAt'])
export class Document {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @ManyToOne(() => User, (user) => user.documents)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'listing_id', nullable: true })
  @IsOptional()
  @IsUUID()
  listingId: string | null = null;

  @ManyToOne(() => Listing, (listing) => listing.documents, { nullable: true })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing | null = null;

  @Column({
    type: 'enum',
    enum: DocumentType,
  })
  @IsEnum(DocumentType)
  type!: DocumentType;

  @Column({ name: 'file_url' })
  @IsNotEmpty()
  @IsString()
  fileUrl!: string;

  @Column({ name: 'file_name' })
  @IsNotEmpty()
  @IsString()
  fileName!: string;

  @Column({ name: 'file_size', type: 'bigint' })
  @IsNotEmpty()
  fileSize!: number;

  @Column({ name: 'mime_type' })
  @IsNotEmpty()
  @IsString()
  mimeType!: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsJSON()
  metadata: Record<string, any> | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
