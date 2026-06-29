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
import { User } from './user.entity';

export enum SellerPayoutStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  FAILED = 'failed',
}

@Entity('seller_payout_accounts')
@Index(['userId'], { unique: true })
@Index(['status'])
export class SellerPayoutAccount {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  userId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'bank_name' })
  bankName!: string;

  @Column({ name: 'bank_code' })
  bankCode!: string;

  @Column({ name: 'account_number' })
  accountNumber!: string;

  @Column({ name: 'account_name' })
  accountName!: string;

  @Column({ default: 'NGN' })
  currency!: string;

  @Column({
    type: 'enum',
    enum: SellerPayoutStatus,
    default: SellerPayoutStatus.PENDING,
  })
  status!: SellerPayoutStatus;

  @Column({ name: 'flutterwave_subaccount_id', type: 'varchar', nullable: true })
  flutterwaveSubaccountId: string | null = null;

  @Column({ name: 'flutterwave_subaccount_reference', type: 'varchar', nullable: true })
  flutterwaveSubaccountReference: string | null = null;

  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string | null = null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
