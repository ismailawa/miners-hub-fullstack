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
  IsNumber,
  IsDate,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';
import { Listing } from './listing.entity';
import { Bid } from './bid.entity';

@Entity('auctions')
@Index(['listingId'])
@Index(['startTime'])
@Index(['endTime'])
@Index(['status'])
export class Auction {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'listing_id', unique: true })
  @IsNotEmpty()
  listingId!: string;

  @ManyToOne(() => Listing, (listing) => listing.auctions)
  @JoinColumn({ name: 'listing_id' })
  listing!: Listing;

  @Column({ name: 'start_time', type: 'timestamp' })
  @IsNotEmpty()
  @IsDate()
  startTime!: Date;

  @Column({ name: 'end_time', type: 'timestamp' })
  @IsNotEmpty()
  @IsDate()
  endTime!: Date;

  @Column({ name: 'starting_bid', type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  startingBid!: number;

  @Column({
    name: 'current_bid',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  currentBid: number | null = null;

  @Column({
    name: 'minimum_increment',
    type: 'decimal',
    precision: 10,
    scale: 2,
    default: 0,
  })
  @IsNumber()
  @Min(0)
  minimumIncrement!: number;

  @Column({ default: 'active' })
  @IsString()
  status!: 'active' | 'completed' | 'cancelled';

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => Bid, (bid) => bid.auction)
  bids!: Bid[];
}
