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
import { IsEmail, IsEnum, IsNotEmpty } from 'class-validator';
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

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @Column({ name: 'password_hash' })
  @IsNotEmpty()
  passwordHash!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.MINER,
  })
  @IsEnum(UserRole)
  role!: UserRole;

  @Column({
    name: 'verification_status',
    type: 'enum',
    enum: VerificationStatus,
    default: VerificationStatus.PENDING,
  })
  @IsEnum(VerificationStatus)
  verificationStatus!: VerificationStatus;

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
