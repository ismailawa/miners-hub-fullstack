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
import { License } from './license.entity';
import { MineSite } from './mine-site.entity';
import { User } from './user.entity';

export enum EsgObligationType {
  COMMUNITY_DEVELOPMENT_AGREEMENT = 'community_development_agreement',
  ENVIRONMENTAL_IMPACT_ASSESSMENT = 'environmental_impact_assessment',
  REHABILITATION_PROGRAM = 'rehabilitation_program',
  RECLAMATION_RESERVE = 'reclamation_reserve',
  COMPENSATION_REMEDIATION = 'compensation_remediation',
  COMMUNITY_BENEFIT = 'community_benefit',
  OTHER = 'other',
}

export enum EsgObligationStatus {
  MISSING = 'missing',
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  APPROVED = 'approved',
  ACTION_REQUIRED = 'action_required',
  OVERDUE = 'overdue',
  FULFILLED = 'fulfilled',
  WAIVED = 'waived',
}

@Entity('esg_obligations')
@Index(['siteId'])
@Index(['licenseId'])
@Index(['responsibleUserId'])
@Index(['obligationType'])
@Index(['status'])
@Index(['dueDate'])
export class EsgObligation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'site_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @ManyToOne(() => MineSite, { nullable: true })
  @JoinColumn({ name: 'site_id' })
  site?: MineSite | null;

  @Column({ name: 'license_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @ManyToOne(() => License, { nullable: true })
  @JoinColumn({ name: 'license_id' })
  license?: License | null;

  @Column({ name: 'responsible_user_id', type: 'uuid' })
  @IsUUID()
  responsibleUserId!: string;

  @ManyToOne(() => User, { nullable: false })
  @JoinColumn({ name: 'responsible_user_id' })
  responsibleUser!: User;

  @Column({
    name: 'obligation_type',
    type: 'enum',
    enum: EsgObligationType,
  })
  @IsEnum(EsgObligationType)
  obligationType!: EsgObligationType;

  @Column({ name: 'title', type: 'varchar' })
  @IsString()
  title!: string;

  @Column({ name: 'description', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  description?: string | null;

  @Column({
    type: 'enum',
    enum: EsgObligationStatus,
    default: EsgObligationStatus.MISSING,
  })
  @IsEnum(EsgObligationStatus)
  status!: EsgObligationStatus;

  @Column({ name: 'document_ids', type: 'uuid', array: true, default: [] })
  documentIds!: string[];

  @Column({ name: 'evidence_urls', type: 'text', array: true, default: [] })
  evidenceUrls!: string[];

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ name: 'last_reviewed_by', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  lastReviewedBy?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'last_reviewed_by' })
  lastReviewer?: User | null;

  @Column({ name: 'last_reviewed_at', type: 'timestamp', nullable: true })
  lastReviewedAt?: Date | null;

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
