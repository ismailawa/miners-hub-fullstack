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
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { LogisticsProvider } from './logistics-provider.entity';
import { User } from './user.entity';

export enum LogisticsQuoteStatus {
  REQUESTED = 'requested',
  QUOTED = 'quoted',
  ACCEPTED = 'accepted',
  DECLINED = 'declined',
}

@Entity('logistics_quote_requests')
@Index(['requesterUserId'])
@Index(['status'])
@Index(['createdAt'])
export class LogisticsQuoteRequest {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'requester_user_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  requesterUserId?: string | null;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  orderId?: string | null;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  providerId?: string | null;

  @ManyToOne(() => LogisticsProvider, { nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider?: LogisticsProvider | null;

  @Column()
  @IsNotEmpty()
  @IsString()
  origin!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  destination!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  commodity!: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  @IsNumber()
  @Min(0)
  weight!: number;

  @Column({ name: 'container_type' })
  @IsString()
  containerType!: string;

  @Column({ name: 'contact_name' })
  @IsString()
  contactName!: string;

  @Column({ name: 'contact_email' })
  @IsString()
  contactEmail!: string;

  @Column({
    type: 'enum',
    enum: LogisticsQuoteStatus,
    default: LogisticsQuoteStatus.REQUESTED,
  })
  @IsEnum(LogisticsQuoteStatus)
  status!: LogisticsQuoteStatus;

  @Column({ name: 'quoted_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  quotedAmount?: number | null;

  @Column({ name: 'quote_notes', type: 'text', nullable: true })
  quoteNotes?: string | null;

  @Column({ name: 'eta', type: 'varchar', nullable: true })
  eta?: string | null;

  @Column({ name: 'route_notes', type: 'text', nullable: true })
  routeNotes?: string | null;

  @Column({ name: 'cost_breakdown', type: 'jsonb', nullable: true })
  costBreakdown?: Record<string, any> | null;

  @Column({ name: 'currency', default: 'NGN' })
  currency!: string;

  @Column({ name: 'valid_until', type: 'timestamp', nullable: true })
  validUntil?: Date | null;

  @Column({ name: 'accepted_by_user_id', type: 'uuid', nullable: true })
  acceptedByUserId?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'accepted_by_user_id' })
  acceptedBy?: User | null;

  @Column({ name: 'accepted_at', type: 'timestamp', nullable: true })
  acceptedAt?: Date | null;

  @Column({ name: 'shipment_id', type: 'uuid', nullable: true })
  shipmentId?: string | null;

  @Column({ name: 'request_metadata', type: 'jsonb', nullable: true })
  requestMetadata?: Record<string, any> | null;

  @Column({ name: 'invoice_metadata', type: 'jsonb', nullable: true })
  invoiceMetadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
