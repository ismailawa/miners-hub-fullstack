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
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { Miner } from './miner.entity';

export enum MineSiteStatus {
  PLANNED = 'planned',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  CLOSED = 'closed',
}

export enum MineSiteRiskLevel {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('mine_sites')
@Index(['operatorId'])
@Index(['state'])
@Index(['siteStatus'])
@Index(['riskLevel'])
export class MineSite {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  name!: string;

  @Column({ name: 'operator_id', type: 'uuid' })
  @IsNotEmpty()
  @IsUUID()
  operatorId!: string;

  @ManyToOne(() => Miner, { nullable: false })
  @JoinColumn({ name: 'operator_id' })
  operator!: Miner;

  @Column({ name: 'license_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  licenseId?: string | null;

  @Column({ name: 'mineral_types', type: 'text', array: true, default: [] })
  @IsArray()
  mineralTypes!: string[];

  @Column()
  @IsNotEmpty()
  @IsString()
  state!: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  lga?: string | null;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  community?: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @Column({ name: 'boundary_polygon', type: 'jsonb', nullable: true })
  boundaryPolygon?: Record<string, any> | null;

  @Column({
    name: 'site_status',
    type: 'enum',
    enum: MineSiteStatus,
    default: MineSiteStatus.PLANNED,
  })
  @IsEnum(MineSiteStatus)
  siteStatus!: MineSiteStatus;

  @Column({
    name: 'risk_level',
    type: 'enum',
    enum: MineSiteRiskLevel,
    default: MineSiteRiskLevel.MEDIUM,
  })
  @IsEnum(MineSiteRiskLevel)
  riskLevel!: MineSiteRiskLevel;

  @Column({ name: 'document_ids', type: 'uuid', array: true, default: [] })
  documentIds!: string[];

  @Column({ name: 'production_report_ids', type: 'uuid', array: true, default: [] })
  productionReportIds!: string[];

  @Column({ name: 'compliance_case_ids', type: 'uuid', array: true, default: [] })
  complianceCaseIds!: string[];

  @Column({ name: 'environmental_record_ids', type: 'uuid', array: true, default: [] })
  environmentalRecordIds!: string[];

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any> | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
