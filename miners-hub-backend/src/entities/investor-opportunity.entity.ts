import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { MineSite } from './mine-site.entity';
import { User } from './user.entity';
import { InvestorOpportunityInquiry } from './investor-opportunity-inquiry.entity';

export enum InvestorOpportunityStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
  ARCHIVED = 'archived',
}

export enum InvestorOpportunityStage {
  EXPLORATION = 'exploration',
  DEVELOPMENT = 'development',
  PRODUCTION = 'production',
  EXPANSION = 'expansion',
}

export enum InvestorOpportunityRiskRating {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum InvestorOpportunityReviewStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  APPROVED = 'approved',
  ACTION_REQUIRED = 'action_required',
  REJECTED = 'rejected',
}

@Entity('investor_opportunities')
@Index(['siteId'])
@Index(['sponsorId'])
@Index(['status'])
@Index(['stage'])
@Index(['riskRating'])
@Index(['dueDiligenceReviewStatus'])
export class InvestorOpportunity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'site_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  siteId?: string | null;

  @ManyToOne(() => MineSite, { nullable: true })
  @JoinColumn({ name: 'site_id' })
  site?: MineSite | null;

  @Column({ name: 'sponsor_id', type: 'uuid' })
  @IsUUID()
  sponsorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sponsor_id' })
  sponsor!: User;

  @Column()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Column({ name: 'mineral_focus', type: 'text', array: true, default: [] })
  @IsArray()
  @IsString({ each: true })
  mineralFocus!: string[];

  @Column({
    name: 'capital_required',
    type: 'decimal',
    precision: 14,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  capitalRequired?: number | null;

  @Column({ name: 'investment_type' })
  @IsString()
  investmentType!: string;

  @Column({
    type: 'enum',
    enum: InvestorOpportunityStage,
    default: InvestorOpportunityStage.DEVELOPMENT,
  })
  @IsEnum(InvestorOpportunityStage)
  stage!: InvestorOpportunityStage;

  @Column({
    name: 'risk_rating',
    type: 'enum',
    enum: InvestorOpportunityRiskRating,
    default: InvestorOpportunityRiskRating.MEDIUM,
  })
  @IsEnum(InvestorOpportunityRiskRating)
  riskRating!: InvestorOpportunityRiskRating;

  @Column({ name: 'license_status', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  licenseStatus?: string | null;

  @Column({ type: 'text' })
  @IsString()
  summary!: string;

  @Column({ name: 'due_diligence_documents', type: 'jsonb', default: [] })
  dueDiligenceDocuments!: Array<{
    title: string;
    url: string;
    type?: string;
    restricted?: boolean;
  }>;

  @Column({ name: 'risk_indicators', type: 'text', array: true, default: [] })
  riskIndicators!: string[];

  @Column({ name: 'risk_score', type: 'int', default: 50 })
  @IsNumber()
  riskScore!: number;

  @Column({ name: 'risk_score_breakdown', type: 'jsonb', nullable: true })
  riskScoreBreakdown?: Record<string, any> | null;

  @Column({ name: 'due_diligence_summary', type: 'jsonb', nullable: true })
  dueDiligenceSummary?: Record<string, any> | null;

  @Column({
    name: 'due_diligence_review_status',
    type: 'enum',
    enum: InvestorOpportunityReviewStatus,
    default: InvestorOpportunityReviewStatus.DRAFT,
  })
  @IsEnum(InvestorOpportunityReviewStatus)
  dueDiligenceReviewStatus!: InvestorOpportunityReviewStatus;

  @Column({ name: 'due_diligence_review_notes', type: 'text', nullable: true })
  dueDiligenceReviewNotes?: string | null;

  @Column({ name: 'due_diligence_reviewed_by', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  dueDiligenceReviewedBy?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'due_diligence_reviewed_by' })
  dueDiligenceReviewer?: User | null;

  @Column({
    name: 'due_diligence_reviewed_at',
    type: 'timestamp',
    nullable: true,
  })
  dueDiligenceReviewedAt?: Date | null;

  @Column({ name: 'analytics_subscription_enabled', default: false })
  analyticsSubscriptionEnabled!: boolean;

  @Column({
    type: 'enum',
    enum: InvestorOpportunityStatus,
    default: InvestorOpportunityStatus.DRAFT,
  })
  @IsEnum(InvestorOpportunityStatus)
  status!: InvestorOpportunityStatus;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt?: Date | null;

  @OneToMany(() => InvestorOpportunityInquiry, (inquiry) => inquiry.opportunity)
  inquiries?: InvestorOpportunityInquiry[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
