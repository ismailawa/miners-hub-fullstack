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
  IsUUID,
  IsEnum,
  IsOptional,
  IsString,
  IsJSON,
} from 'class-validator';
import { User } from './user.entity';
import { Listing } from './listing.entity';

export enum ContractStatus {
  DRAFT = 'draft',
  PROPOSED = 'proposed',
  UNDER_REVIEW = 'under_review',
  SIGNED = 'signed',
  EXECUTED = 'executed',
  TERMINATED = 'terminated',
}

@Entity('contracts')
@Index(['party1Id'])
@Index(['party2Id'])
@Index(['listingId'])
@Index(['status'])
@Index(['createdAt'])
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'party1_id' })
  @IsNotEmpty()
  @IsUUID()
  party1Id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'party1_id' })
  party1!: User;

  @Column({ name: 'party2_id' })
  @IsNotEmpty()
  @IsUUID()
  party2Id!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'party2_id' })
  party2!: User;

  @Column({ name: 'listing_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  listingId: string | null = null;

  @ManyToOne(() => Listing, { nullable: true })
  @JoinColumn({ name: 'listing_id' })
  listing: Listing | null = null;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  terms!: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsJSON()
  metadata: Record<string, any> | null = null;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.DRAFT,
  })
  @IsEnum(ContractStatus)
  status!: ContractStatus;

  @Column({ name: 'party1_signed_at', type: 'timestamp', nullable: true })
  @IsOptional()
  party1SignedAt: Date | null = null;

  @Column({ name: 'party2_signed_at', type: 'timestamp', nullable: true })
  @IsOptional()
  party2SignedAt: Date | null = null;

  @Column({ name: 'party1_signature', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  party1Signature: string | null = null;

  @Column({ name: 'party2_signature', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  party2Signature: string | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
