import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { User } from './user.entity';
import { Listing } from './listing.entity';

@Entity('miners')
@Index(['userId'])
@Index(['location'])
export class Miner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', unique: true })
  @IsNotEmpty()
  userId!: string;

  @OneToOne(() => User, (user) => user.miner)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'company_name' })
  @IsNotEmpty()
  @IsString()
  companyName!: string;

  @Column({ name: 'mining_licence', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  miningLicence: string | null = null;

  @Column()
  @IsNotEmpty()
  @IsString()
  location!: string; // State/LGA

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => Listing, (listing) => listing.miner)
  listings!: Listing[];
}
