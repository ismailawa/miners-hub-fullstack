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
import { Order } from './order.entity';

export enum ShipmentStatus {
  QUOTE_REQUESTED = 'quote_requested',
  SCHEDULED = 'scheduled',
  PICKED_UP = 'picked_up',
  IN_TRANSIT = 'in_transit',
  AT_CHECKPOINT = 'at_checkpoint',
  DELIVERED = 'delivered',
  DISPUTED = 'disputed',
  CANCELLED = 'cancelled',
}

@Entity('shipments')
@Index(['orderId'])
@Index(['providerId'])
@Index(['status'])
@Index(['trackingId'])
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'tracking_id', unique: true })
  @IsString()
  trackingId!: string;

  @Column({ name: 'order_id', type: 'uuid' })
  @IsUUID()
  orderId!: string;

  @ManyToOne(() => Order, { nullable: false })
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  providerId?: string | null;

  @ManyToOne(() => LogisticsProvider, { nullable: true })
  @JoinColumn({ name: 'provider_id' })
  provider?: LogisticsProvider | null;

  @Column({ name: 'mineral_passport_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  mineralPassportId?: string | null;

  @Column({ name: 'quote_amount', type: 'decimal', precision: 12, scale: 2, nullable: true })
  @IsOptional()
  @IsNumber()
  @Min(0)
  quoteAmount?: number | null;

  @Column({ name: 'quote_request_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  quoteRequestId?: string | null;

  @Column({ name: 'currency', default: 'NGN' })
  @IsString()
  currency!: string;

  @Column({ name: 'pickup_location', type: 'text' })
  @IsNotEmpty()
  @IsString()
  pickupLocation!: string;

  @Column({ name: 'delivery_location', type: 'text' })
  @IsNotEmpty()
  @IsString()
  deliveryLocation!: string;

  @Column({
    type: 'enum',
    enum: ShipmentStatus,
    default: ShipmentStatus.QUOTE_REQUESTED,
  })
  @IsEnum(ShipmentStatus)
  status!: ShipmentStatus;

  @Column({ name: 'current_milestone', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  currentMilestone?: string | null;

  @Column({ type: 'jsonb', default: [] })
  milestones!: Array<{
    status: ShipmentStatus;
    location?: string;
    notes?: string;
    occurredAt: string;
  }>;

  @Column({ name: 'handoff_evidence', type: 'jsonb', nullable: true })
  handoffEvidence?: Record<string, any> | null;

  @Column({ name: 'tracking_references', type: 'jsonb', nullable: true })
  trackingReferences?: Record<string, any> | null;

  @Column({ name: 'international_details', type: 'jsonb', nullable: true })
  internationalDetails?: Record<string, any> | null;

  @Column({ name: 'invoice_metadata', type: 'jsonb', nullable: true })
  invoiceMetadata?: Record<string, any> | null;

  @Column({ name: 'delivered_at', type: 'timestamp', nullable: true })
  deliveredAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
