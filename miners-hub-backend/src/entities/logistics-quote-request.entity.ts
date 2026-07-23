import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUUID, Min } from 'class-validator';

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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
