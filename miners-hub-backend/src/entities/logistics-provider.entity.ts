import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { User } from './user.entity';

export enum LogisticsProviderStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

export enum LogisticsProviderCategory {
  INTERNATIONAL_CARRIER = 'international_carrier',
  LOCAL_HAULAGE = 'local_haulage',
  WAREHOUSING = 'warehousing',
  CUSTOMS_CLEARING = 'customs_clearing',
  LAST_MILE = 'last_mile',
}

@Entity('logistics_providers')
@Index(['userId'])
@Index(['status'])
@Index(['category'])
export class LogisticsProvider {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  userId?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'user_id' })
  user?: User | null;

  @Column({ name: 'company_name' })
  @IsNotEmpty()
  @IsString()
  companyName!: string;

  @Column({
    type: 'enum',
    enum: LogisticsProviderCategory,
    default: LogisticsProviderCategory.LOCAL_HAULAGE,
  })
  @IsEnum(LogisticsProviderCategory)
  category!: LogisticsProviderCategory;

  @Column({ name: 'service_areas', type: 'text', array: true, default: [] })
  @IsArray()
  serviceAreas!: string[];

  @Column({ type: 'text', array: true, default: [] })
  @IsArray()
  capabilities!: string[];

  @Column({
    type: 'enum',
    enum: LogisticsProviderStatus,
    default: LogisticsProviderStatus.PENDING,
  })
  @IsEnum(LogisticsProviderStatus)
  status!: LogisticsProviderStatus;

  @Column({ name: 'contact_email', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  contactEmail?: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  contactPhone?: string | null;

  @Column({ name: 'fleet_profiles', type: 'jsonb', default: [] })
  fleetProfiles!: Array<{
    plateNumber?: string;
    vehicleType?: string;
    capacityTons?: number;
    driverName?: string;
    driverPhone?: string;
    insuranceStatus?: string;
    complianceDocumentUrls?: string[];
    availability?: 'available' | 'busy' | 'offline';
  }>;

  @Column({ name: 'integration_metadata', type: 'jsonb', nullable: true })
  integrationMetadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
