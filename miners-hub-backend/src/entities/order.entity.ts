import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  IsNotEmpty,
  IsNumber,
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { User } from './user.entity';
import { Listing } from './listing.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('orders')
@Index(['buyerId'])
@Index(['sellerId'])
@Index(['listingId'])
@Index(['status'])
@Index(['createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'buyer_id' })
  @IsNotEmpty()
  @IsUUID()
  buyerId!: string;

  @ManyToOne(() => User, (user) => user.orders)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: User;

  @Column({ name: 'seller_id' })
  @IsNotEmpty()
  @IsUUID()
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @Column({ name: 'listing_id' })
  @IsNotEmpty()
  @IsUUID()
  listingId!: string;

  @ManyToOne(() => Listing, (listing) => listing.orders)
  @JoinColumn({ name: 'listing_id' })
  listing!: Listing;

  @Column({ name: 'total_amount', type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  totalAmount!: number;

  @Column({ name: 'quantity', type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity!: number;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  @IsEnum(OrderStatus)
  status!: OrderStatus;

  @Column({ name: 'delivery_address', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  deliveryAddress: string | null = null;

  @Column({ name: 'payment_status', default: 'pending' })
  @IsString()
  paymentStatus!: 'pending' | 'paid' | 'refunded';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
