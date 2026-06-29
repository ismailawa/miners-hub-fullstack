import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional } from 'class-validator';
import { Miner } from './miner.entity';
import { Investor } from './investor.entity';
import { Listing } from './listing.entity';
import { Order } from './order.entity';
import { Chat } from './chat.entity';
import { Notification } from './notification.entity';
import { Document } from './document.entity';

export enum UserRole {
  MINER = 'miner',
  INVESTOR = 'investor',
  GOVERNMENT = 'government',
  ADMIN = 'admin',
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('users')
@Index(['email'])
@Index(['role'])
@Index(['verificationStatus'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name?: string;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Column({ name: 'password_hash', select: false })
  @IsNotEmpty()
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    nullable: true,
  })
  @IsEnum(UserRole)
  @IsOptional()
  role!: UserRole | null;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  @IsEnum(VerificationStatus)
  verificationStatus!: VerificationStatus;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber?: string;

  @Column({ type: 'text', nullable: true })
  address?: string;

  @Column({ name: 'date_of_birth', type: 'date', nullable: true })
  dateOfBirth?: string;

  @Column({ nullable: true })
  nationality?: string;

  @Column({ nullable: true })
  nin?: string;

  @Column({ name: 'onboarding_complete', default: false })
  onboardingComplete!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToOne(() => Miner, (miner) => miner.user, { nullable: true })
  miner?: Miner;

  @OneToOne(() => Investor, (investor) => investor.user, { nullable: true })
  investor?: Investor;

  @OneToMany(() => Listing, (listing) => listing.miner)
  listings!: Listing[];

  @OneToMany(() => Order, (order) => order.buyer)
  orders!: Order[];

  @OneToMany(() => Chat, (chat) => chat.sender)
  sentChats!: Chat[];

  @OneToMany(() => Chat, (chat) => chat.receiver)
  receivedChats!: Chat[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Document, (document) => document.user)
  documents!: Document[];
}
