import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  Min,
} from 'class-validator';
import { Miner } from './miner.entity';
import { Auction } from './auction.entity';
import { Order } from './order.entity';
import { Document } from './document.entity';

export enum ListingStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  PUBLISHED = 'published',
  SOLD = 'sold',
  EXPIRED = 'expired',
  ARCHIVED = 'archived',
}

@Entity('listings')
@Index(['minerId'])
@Index(['status'])
@Index(['mineralType'])
@Index(['createdAt'])
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'miner_id' })
  @IsNotEmpty()
  minerId!: string;

  @ManyToOne(() => Miner, (miner) => miner.listings)
  @JoinColumn({ name: 'miner_id' })
  miner!: Miner;

  @Column({ name: 'mineral_type' })
  @IsNotEmpty()
  @IsString()
  mineralType!: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity!: number; // in tons

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  price!: number;

  @Column({ name: 'grade_purity', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  gradePurity: string | null = null;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  location: string | null = null; // State/LGA

  @Column({
    name: 'moisture_percentage',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  moisturePercentage: number | null = null;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.DRAFT,
  })
  @IsEnum(ListingStatus)
  status!: ListingStatus;

  @Column({ name: 'listing_type', default: 'buy_now' })
  @IsString()
  listingType!: 'buy_now' | 'auction';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => Auction, (auction) => auction.listing)
  auctions!: Auction[];

  @OneToMany(() => Order, (order) => order.listing)
  orders!: Order[];

  @OneToMany(() => Document, (document) => document.listing)
  documents!: Document[];
}
