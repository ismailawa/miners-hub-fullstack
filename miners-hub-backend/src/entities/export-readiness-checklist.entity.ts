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
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { Document } from './document.entity';
import { License } from './license.entity';
import { MineralPassport } from './mineral-passport.entity';
import { Order } from './order.entity';
import { User } from './user.entity';

export enum ExportReadinessStatus {
  DRAFT = 'draft',
  UNDER_REVIEW = 'under_review',
  BLOCKED = 'blocked',
  READY = 'ready',
  EXPIRED = 'expired',
}

export enum ExportCustomsStatus {
  NOT_REQUIRED = 'not_required',
  NOT_STARTED = 'not_started',
  PREPARING = 'preparing',
  SUBMITTED = 'submitted',
  CLEARED = 'cleared',
  HELD = 'held',
  REJECTED = 'rejected',
}

@Entity('export_readiness_checklists')
@Index(['orderId'])
@Index(['mineralPassportId'])
@Index(['exporterUserId'])
@Index(['licenseId'])
@Index(['readinessStatus'])
@Index(['customsStatus'])
export class ExportReadinessChecklist {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string | null;

  @ManyToOne(() => Order, { nullable: true })
  @JoinColumn({ name: 'order_id' })
  order?: Order | null;

  @Column({ name: 'mineral_passport_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  mineralPassportId?: string | null;

  @ManyToOne(() => MineralPassport, { nullable: true })
  @JoinColumn({ name: 'mineral_passport_id' })
  mineralPassport?: MineralPassport | null;

  @Column({ name: 'exporter_user_id', type: 'uuid' })
  @IsUUID()
  exporterUserId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'exporter_user_id' })
  exporter!: User;

  @Column({ name: 'license_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @ManyToOne(() => License, { nullable: true })
  @JoinColumn({ name: 'license_id' })
  license?: License | null;

  @Column({ name: 'export_permit_document_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  exportPermitDocumentId?: string | null;

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'export_permit_document_id' })
  exportPermitDocument?: Document | null;

  @Column({ name: 'assay_document_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  assayDocumentId?: string | null;

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'assay_document_id' })
  assayDocument?: Document | null;

  @Column({ name: 'invoice_document_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  invoiceDocumentId?: string | null;

  @ManyToOne(() => Document, { nullable: true })
  @JoinColumn({ name: 'invoice_document_id' })
  invoiceDocument?: Document | null;

  @Column({
    name: 'customs_status',
    type: 'enum',
    enum: ExportCustomsStatus,
    default: ExportCustomsStatus.NOT_STARTED,
  })
  @IsEnum(ExportCustomsStatus)
  customsStatus!: ExportCustomsStatus;

  @Column({ name: 'carrier_reference', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  carrierReference?: string | null;

  @Column({
    name: 'readiness_status',
    type: 'enum',
    enum: ExportReadinessStatus,
    default: ExportReadinessStatus.DRAFT,
  })
  @IsEnum(ExportReadinessStatus)
  readinessStatus!: ExportReadinessStatus;

  @Column({ name: 'blocking_issues', type: 'text', array: true, default: [] })
  blockingIssues!: string[];

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes?: string | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  reviewedBy?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
