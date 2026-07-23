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
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { User } from './user.entity';
import { MineSite } from './mine-site.entity';

export enum LicenseType {
  RECONNAISSANCE_PERMIT = 'reconnaissance_permit',
  EXPLORATION_LICENCE = 'exploration_licence',
  SMALL_SCALE_MINING_LEASE = 'small_scale_mining_lease',
  MINING_LEASE = 'mining_lease',
  QUARRY_LEASE = 'quarry_lease',
  WATER_USE_PERMIT = 'water_use_permit',
  POSSESS_AND_PURCHASE_LICENCE = 'possess_and_purchase_licence',
  MINERAL_BUYING_CENTER_LICENCE = 'mineral_buying_center_licence',
  MINERAL_EXPORT_PERMIT = 'mineral_export_permit',
}

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
@Index(['licenseType'])
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

  @Column({
    name: 'license_type',
    type: 'enum',
    enum: LicenseType,
    default: LicenseType.MINING_LEASE,
  })
  @IsNotEmpty()
  @IsEnum(LicenseType)
  licenseType!: LicenseType;

  @Column({ name: 'issuing_authority' })
  @IsNotEmpty()
  @IsString()
  issuingAuthority!: string;

  @Column({ name: 'issue_date', type: 'date' })
  issueDate!: string;

  @Column({ name: 'expiry_date', type: 'date' })
  expiryDate!: string;

  @Column({
    name: 'annual_service_fee',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  annualServiceFee?: number | null;

  @Column({ name: 'service_fee_paid_until', type: 'date', nullable: true })
  serviceFeePaidUntil?: string | null;

  @Column({
    name: 'application_priority_date',
    type: 'timestamp',
    nullable: true,
  })
  applicationPriorityDate?: Date | null;

  @Column({
    name: 'permit_shipment_reference',
    type: 'varchar',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  permitShipmentReference?: string | null;

  @Column({ name: 'issuing_office', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  issuingOffice?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

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
