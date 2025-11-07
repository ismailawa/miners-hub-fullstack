import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsUUID, Min } from 'class-validator';
import { Auction } from './auction.entity';
import { User } from './user.entity';

@Entity('bids')
@Index(['auctionId'])
@Index(['bidderId'])
@Index(['createdAt'])
@Index(['amount'])
export class Bid {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'auction_id' })
  @IsNotEmpty()
  @IsUUID()
  auctionId!: string;

  @ManyToOne(() => Auction, (auction) => auction.bids)
  @JoinColumn({ name: 'auction_id' })
  auction!: Auction;

  @Column({ name: 'bidder_id' })
  @IsNotEmpty()
  @IsUUID()
  bidderId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'bidder_id' })
  bidder!: User;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  amount!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
