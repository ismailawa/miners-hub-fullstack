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
import { InvestorOpportunity } from './investor-opportunity.entity';
import { User } from './user.entity';

export enum InvestorOpportunityInquiryStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  DUE_DILIGENCE = 'due_diligence',
  CLOSED = 'closed',
}

@Entity('investor_opportunity_inquiries')
@Index(['opportunityId'])
@Index(['investorId'])
@Index(['status'])
export class InvestorOpportunityInquiry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'opportunity_id', type: 'uuid' })
  @IsUUID()
  opportunityId!: string;

  @ManyToOne(() => InvestorOpportunity, (opportunity) => opportunity.inquiries)
  @JoinColumn({ name: 'opportunity_id' })
  opportunity!: InvestorOpportunity;

  @Column({ name: 'investor_id', type: 'uuid' })
  @IsUUID()
  investorId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'investor_id' })
  investor!: User;

  @Column({ type: 'text' })
  @IsString()
  message!: string;

  @Column({ name: 'investment_range', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  investmentRange?: string | null;

  @Column({ name: 'contact_preference', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  contactPreference?: string | null;

  @Column({ name: 'due_diligence_consent', default: false })
  dueDiligenceConsent!: boolean;

  @Column({ name: 'analytics_subscription_interest', default: false })
  analyticsSubscriptionInterest!: boolean;

  @Column({ type: 'enum', enum: InvestorOpportunityInquiryStatus, default: InvestorOpportunityInquiryStatus.NEW })
  @IsEnum(InvestorOpportunityInquiryStatus)
  status!: InvestorOpportunityInquiryStatus;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  notes?: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
