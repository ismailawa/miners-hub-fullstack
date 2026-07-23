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

@Entity('logistics_providers')
@Index(['userId'])
@Index(['status'])
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

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
