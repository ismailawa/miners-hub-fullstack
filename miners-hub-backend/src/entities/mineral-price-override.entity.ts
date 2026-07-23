import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum MineralPriceOverrideStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('mineral_price_overrides')
@Index(['symbol'])
@Index(['status'])
@Index(['displayOrder'])
export class MineralPriceOverride {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 120 })
  name!: string;

  @Column({ type: 'varchar', length: 24 })
  symbol!: string;

  @Column({ type: 'decimal', precision: 16, scale: 2 })
  price!: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  change!: number;

  @Column({ type: 'varchar', length: 80, default: 'Admin reference' })
  source!: string;

  @Column({ name: 'display_order', type: 'int', default: 100 })
  displayOrder!: number;

  @Column({
    type: 'enum',
    enum: MineralPriceOverrideStatus,
    default: MineralPriceOverrideStatus.PUBLISHED,
  })
  status!: MineralPriceOverrideStatus;

  @Column({ name: 'last_reported_at', type: 'timestamp', nullable: true })
  lastReportedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
