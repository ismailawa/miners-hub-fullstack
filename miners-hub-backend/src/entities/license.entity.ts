import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { User } from './user.entity';
import { MineSite } from './mine-site.entity';

export enum LicenseStatus {
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

export enum LicenseRenewalStatus {
  NOT_DUE = 'not_due',
  DUE_SOON = 'due_soon',
  IN_PROGRESS = 'in_progress',
  RENEWED = 'renewed',
}

@Entity('licenses')
@Index(['holderUserId'])
@Index(['siteId'])
@Index(['status'])
@Index(['expiryDate'])
export class License {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'holder_user_id', type: 'uuid' })
  @IsUUID()
  holderUserId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'holder_user_id' })
  holder!: User;

  @Column({ name: 'site_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @ManyToOne(() => MineSite, { nullable: true })
  @JoinColumn({ name: 'site_id' })
  site?: MineSite | null;

  @Column({ name: 'license_number', unique: true })
  @IsNotEmpty()
  @IsString()
  licenseNumber!: string;

  @Column({ name: 'license_type' })
  @IsNotEmpty()
  @IsString()
  licenseType!: string;

  @Column({ name: 'issuing_authority' })
  @IsNotEmpty()
  @IsString()
  issuingAuthority!: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: string;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate!: string;

  @Column({
    type: 'enum',
    enum: LicenseStatus,
    default: LicenseStatus.SUBMITTED,
  })
  @IsEnum(LicenseStatus)
  status!: LicenseStatus;

  @Column({
    name: 'renewal_status',
    type: 'enum',
    enum: LicenseRenewalStatus,
    default: LicenseRenewalStatus.NOT_DUE,
  })
  @IsEnum(LicenseRenewalStatus)
  renewalStatus!: LicenseRenewalStatus;

  @Column({ name: 'document_ids', type: 'uuid', array: true, default: [] })
  documentIds!: string[];

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes?: string | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  reviewedBy?: string | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
