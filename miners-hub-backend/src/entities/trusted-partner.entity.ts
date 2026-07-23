import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum TrustedPartnerStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

@Entity('trusted_partners')
@Index(['status'])
@Index(['displayOrder'])
export class TrustedPartner {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ name: 'logo_url', type: 'text' })
  logoUrl!: string;

  @Column({ name: 'website_url', type: 'text', nullable: true })
  websiteUrl?: string | null;

  @Column({ type: 'varchar', nullable: true })
  category?: string | null;

  @Column({ name: 'display_order', type: 'int', default: 0 })
  displayOrder!: number;

  @Column({
    type: 'enum',
    enum: TrustedPartnerStatus,
    default: TrustedPartnerStatus.PUBLISHED,
  })
  status!: TrustedPartnerStatus;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
