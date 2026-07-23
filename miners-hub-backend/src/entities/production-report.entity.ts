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
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { MineSite } from './mine-site.entity';
import { Miner } from './miner.entity';
import { User } from './user.entity';

export enum ProductionReportStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  OVERDUE = 'overdue',
}

@Entity('production_reports')
@Index(['siteId'])
@Index(['minerId'])
@Index(['status'])
@Index(['periodStart'])
@Index(['periodEnd'])
export class ProductionReport {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'site_id', type: 'uuid' })
  @IsUUID()
  siteId!: string;

  @ManyToOne(() => MineSite, { nullable: false })
  @JoinColumn({ name: 'site_id' })
  site!: MineSite;

  @Column({ name: 'miner_id', type: 'uuid' })
  @IsUUID()
  minerId!: string;

  @ManyToOne(() => Miner, { nullable: false })
  @JoinColumn({ name: 'miner_id' })
  miner!: Miner;

  @Column({ name: 'mineral_type' })
  @IsNotEmpty()
  @IsString()
  mineralType!: string;

  @Column({ name: 'period_start', type: 'date' })
  periodStart!: string;

  @Column({ name: 'period_end', type: 'date' })
  periodEnd!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  quantity!: number;

  @Column()
  @IsString()
  unit!: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  grade?: string | null;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  destination?: string | null;

  @Column({ name: 'estimated_value', type: 'decimal', precision: 14, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  estimatedValue?: number | null;

  @Column({ name: 'royalty_rate', type: 'decimal', precision: 5, scale: 2, default: 3 })
  @IsNumber()
  royaltyRate!: number;

  @Column({ name: 'royalty_due', type: 'decimal', precision: 14, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  royaltyDue?: number | null;

  @Column({ name: 'supporting_document_ids', type: 'uuid', array: true, default: [] })
  supportingDocumentIds!: string[];

  @Column({
    type: 'enum',
    enum: ProductionReportStatus,
    default: ProductionReportStatus.DRAFT,
  })
  @IsEnum(ProductionReportStatus)
  status!: ProductionReportStatus;

  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt?: Date | null;

  @Column({ name: 'reviewed_by', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  reviewedBy?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewer?: User | null;

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt?: Date | null;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes?: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
