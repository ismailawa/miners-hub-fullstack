import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { SellerPayoutAccount } from './seller-payout-account.entity';
import { User } from './user.entity';

export enum EscrowStatus {
  PENDING_PAYMENT = 'pending_payment',
  FUNDED = 'funded',
  AWAITING_RELEASE = 'awaiting_release',
  RELEASE_PROCESSING = 'release_processing',
  RELEASED = 'released',
  REFUND_PROCESSING = 'refund_processing',
  REFUNDED = 'refunded',
  FAILED = 'failed',
}

export enum EscrowTransferStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  SUCCESSFUL = 'successful',
  FAILED = 'failed',
}

@Entity('escrow_transactions')
@Index(['orderId'], { unique: true })
@Index(['buyerId'])
@Index(['sellerId'])
@Index(['status'])
@Index(['flutterwaveTxRef'], { unique: true })
export class EscrowTransaction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'order_id' })
  orderId!: string;

  @OneToOne(() => Order, (order) => order.escrowTransaction)
  @JoinColumn({ name: 'order_id' })
  order!: Order;

  @Column({ name: 'buyer_id' })
  buyerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyer_id' })
  buyer!: User;

  @Column({ name: 'seller_id' })
  sellerId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'seller_id' })
  seller!: User;

  @Column({ name: 'seller_payout_account_id', type: 'uuid', nullable: true })
  sellerPayoutAccountId: string | null = null;

  @ManyToOne(() => SellerPayoutAccount, { nullable: true })
  @JoinColumn({ name: 'seller_payout_account_id' })
  sellerPayoutAccount: SellerPayoutAccount | null = null;

  @Column({ name: 'gross_amount', type: 'decimal', precision: 12, scale: 2 })
  grossAmount!: number;

  @Column({
    name: 'commission_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  commissionAmount!: number;

  @Column({
    name: 'seller_net_amount',
    type: 'decimal',
    precision: 12,
    scale: 2,
  })
  sellerNetAmount!: number;

  @Column({ default: 'NGN' })
  currency!: string;

  @Column({ name: 'payment_gateway', default: 'flutterwave' })
  paymentGateway!: string;

  @Column({
    type: 'enum',
    enum: EscrowStatus,
    default: EscrowStatus.PENDING_PAYMENT,
  })
  status!: EscrowStatus;

  @Column({ name: 'flutterwave_tx_ref' })
  flutterwaveTxRef!: string;

  @Column({ name: 'gateway_tx_ref', type: 'varchar', nullable: true })
  gatewayTxRef: string | null = null;

  @Column({ name: 'gateway_transaction_id', type: 'varchar', nullable: true })
  gatewayTransactionId: string | null = null;

  @Column({ name: 'gateway_payment_link', type: 'text', nullable: true })
  gatewayPaymentLink: string | null = null;

  @Column({ name: 'gateway_payment_status', type: 'varchar', nullable: true })
  gatewayPaymentStatus: string | null = null;

  @Column({
    name: 'flutterwave_transaction_id',
    type: 'varchar',
    nullable: true,
  })
  flutterwaveTransactionId: string | null = null;

  @Column({ name: 'flutterwave_payment_link', type: 'text', nullable: true })
  flutterwavePaymentLink: string | null = null;

  @Column({
    name: 'flutterwave_payment_status',
    type: 'varchar',
    nullable: true,
  })
  flutterwavePaymentStatus: string | null = null;

  @Column({
    name: 'seller_transfer_reference',
    type: 'varchar',
    nullable: true,
  })
  sellerTransferReference: string | null = null;

  @Column({
    name: 'seller_transfer_status',
    default: EscrowTransferStatus.NOT_STARTED,
  })
  sellerTransferStatus!: EscrowTransferStatus;

  @Column({ name: 'seller_transfer_id', type: 'varchar', nullable: true })
  sellerTransferId: string | null = null;

  @Column({
    name: 'platform_commission_transfer_reference',
    type: 'varchar',
    nullable: true,
  })
  platformCommissionTransferReference: string | null = null;

  @Column({
    name: 'platform_commission_transfer_status',
    default: EscrowTransferStatus.NOT_STARTED,
  })
  platformCommissionTransferStatus!: EscrowTransferStatus;

  @Column({
    name: 'platform_commission_transfer_id',
    type: 'varchar',
    nullable: true,
  })
  platformCommissionTransferId: string | null = null;

  @Column({ name: 'funded_at', type: 'timestamp', nullable: true })
  fundedAt: Date | null = null;

  @Column({ name: 'released_at', type: 'timestamp', nullable: true })
  releasedAt: Date | null = null;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt: Date | null = null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
