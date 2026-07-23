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
import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { User } from './user.entity';

export enum AmlKybActorType {
  BUYER = 'buyer',
  EXPORTER = 'exporter',
  BUYING_CENTER = 'buying_center',
  INVESTOR = 'investor',
  MINER = 'miner',
  LOGISTICS_PROVIDER = 'logistics_provider',
  LABORATORY = 'laboratory',
  HIGH_VALUE_ACTOR = 'high_value_actor',
  OTHER = 'other',
}

export enum AmlKybRiskTier {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ScumlRegistrationStatus {
  NOT_REQUIRED = 'not_required',
  NOT_PROVIDED = 'not_provided',
  PENDING = 'pending',
  REGISTERED = 'registered',
  EXPIRED = 'expired',
  REJECTED = 'rejected',
}

export enum SuspiciousActivityStatus {
  NONE = 'none',
  MONITORING = 'monitoring',
  ESCALATED = 'escalated',
  REPORTED = 'reported',
  CLOSED = 'closed',
}

export enum AmlKybReviewStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  CLEARED = 'cleared',
  ACTION_REQUIRED = 'action_required',
  SUSPICIOUS = 'suspicious',
  ESCALATED = 'escalated',
  CLOSED = 'closed',
}

@Entity('aml_kyb_risk_profiles')
@Index(['userId'])
@Index(['actorType'])
@Index(['riskTier'])
@Index(['reviewStatus'])
@Index(['suspiciousActivityStatus'])
export class AmlKybRiskProfile {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @IsUUID()
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'actor_type', type: 'enum', enum: AmlKybActorType })
  @IsEnum(AmlKybActorType)
  actorType!: AmlKybActorType;

  @Column({ name: 'business_name', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  businessName?: string | null;

  @Column({
    name: 'business_registration_number',
    type: 'varchar',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  businessRegistrationNumber?: string | null;

  @Column({ name: 'beneficial_owner_summary', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  beneficialOwnerSummary?: string | null;

  @Column({
    name: 'beneficial_owner_document_ids',
    type: 'uuid',
    array: true,
    default: [],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  beneficialOwnerDocumentIds!: string[];

  @Column({
    name: 'scuml_registration_number',
    type: 'varchar',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  scumlRegistrationNumber?: string | null;

  @Column({
    name: 'scuml_registration_status',
    type: 'enum',
    enum: ScumlRegistrationStatus,
    default: ScumlRegistrationStatus.NOT_PROVIDED,
  })
  @IsEnum(ScumlRegistrationStatus)
  scumlRegistrationStatus!: ScumlRegistrationStatus;

  @Column({
    name: 'scuml_document_ids',
    type: 'uuid',
    array: true,
    default: [],
  })
  @IsArray()
  @IsUUID(undefined, { each: true })
  scumlDocumentIds!: string[];

  @Column({ name: 'source_of_funds_notes', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  sourceOfFundsNotes?: string | null;

  @Column({ name: 'source_of_minerals_notes', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  sourceOfMineralsNotes?: string | null;

  @Column({
    name: 'risk_tier',
    type: 'enum',
    enum: AmlKybRiskTier,
    default: AmlKybRiskTier.MEDIUM,
  })
  @IsEnum(AmlKybRiskTier)
  riskTier!: AmlKybRiskTier;

  @Column({ name: 'risk_reasons', type: 'text', array: true, default: [] })
  @IsArray()
  @IsString({ each: true })
  riskReasons!: string[];

  @Column({ name: 'risk_indicators', type: 'text', array: true, default: [] })
  @IsArray()
  @IsString({ each: true })
  riskIndicators!: string[];

  @Column({
    name: 'suspicious_activity_status',
    type: 'enum',
    enum: SuspiciousActivityStatus,
    default: SuspiciousActivityStatus.NONE,
  })
  @IsEnum(SuspiciousActivityStatus)
  suspiciousActivityStatus!: SuspiciousActivityStatus;

  @Column({
    name: 'review_status',
    type: 'enum',
    enum: AmlKybReviewStatus,
    default: AmlKybReviewStatus.SUBMITTED,
  })
  @IsEnum(AmlKybReviewStatus)
  reviewStatus!: AmlKybReviewStatus;

  @Column({ name: 'last_reviewed_by', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  lastReviewedBy?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'last_reviewed_by' })
  reviewer?: User | null;

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
