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
import { MineSite } from './mine-site.entity';
import { ProductionReport } from './production-report.entity';

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

  @Column({ name: 'company_reg_number', nullable: true })
  @IsOptional()
  @IsString()
  companyRegNumber?: string;

  @Column({ name: 'business_address', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  businessAddress?: string;

  @Column({ name: 'business_website', nullable: true })
  @IsOptional()
  @IsString()
  businessWebsite?: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  industry?: string;

  @Column({ name: 'years_in_operation', nullable: true })
  @IsOptional()
  @IsString()
  yearsInOperation?: string;

  @Column({ name: 'cooperative_name', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  cooperativeName?: string | null;

  @Column({ name: 'cooperative_reg_number', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  cooperativeRegNumber?: string | null;

  @Column({ name: 'partner_type', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  partnerType?: string | null;

  @Column({ name: 'partner_organization', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  partnerOrganization?: string | null;

  @Column({ name: 'mining_equipment', type: 'text', array: true, default: [] })
  miningEquipment!: string[];

  @Column({ type: 'text', array: true, default: [] })
  certifications!: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relationships
  @OneToMany(() => Listing, (listing) => listing.miner)
  listings!: Listing[];

  @OneToMany(() => MineSite, (mineSite) => mineSite.operator)
  mineSites!: MineSite[];

  @OneToMany(() => ProductionReport, (report) => report.miner)
  productionReports!: ProductionReport[];
}
