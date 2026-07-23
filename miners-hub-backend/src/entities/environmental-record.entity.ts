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
import { IsArray, IsEnum, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { MineSite } from './mine-site.entity';
import { User } from './user.entity';

export enum EnvironmentalRecordType {
  INSPECTION = 'inspection',
  INCIDENT = 'incident',
  COMMUNITY_CONCERN = 'community_concern',
  MONITORING = 'monitoring',
  REMEDIATION = 'remediation',
}

export enum EnvironmentalSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum EnvironmentalRecordStatus {
  OPEN = 'open',
  UNDER_REVIEW = 'under_review',
  ACTION_REQUIRED = 'action_required',
  IN_REMEDIATION = 'in_remediation',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('environmental_records')
@Index(['siteId'])
@Index(['reportedBy'])
@Index(['recordType'])
@Index(['severity'])
@Index(['status'])
@Index(['createdAt'])
export class EnvironmentalRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'site_id', type: 'uuid' })
  @IsUUID()
  siteId!: string;

  @ManyToOne(() => MineSite, { nullable: false })
  @JoinColumn({ name: 'site_id' })
  site!: MineSite;

  @Column({ name: 'reported_by', type: 'uuid' })
  @IsUUID()
  reportedBy!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'reported_by' })
  reporter!: User;

  @Column({
    name: 'record_type',
    type: 'enum',
    enum: EnvironmentalRecordType,
    default: EnvironmentalRecordType.INSPECTION,
  })
  @IsEnum(EnvironmentalRecordType)
  recordType!: EnvironmentalRecordType;

  @Column({
    type: 'enum',
    enum: EnvironmentalSeverity,
    default: EnvironmentalSeverity.MEDIUM,
  })
  @IsEnum(EnvironmentalSeverity)
  severity!: EnvironmentalSeverity;

  @Column({ type: 'text' })
  @IsString()
  description!: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  @IsOptional()
  @IsNumber()
  latitude?: number | null;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  @IsOptional()
  @IsNumber()
  longitude?: number | null;

  @Column({ name: 'evidence_urls', type: 'text', array: true, default: [] })
  @IsArray()
  evidenceUrls!: string[];

  @Column({
    type: 'enum',
    enum: EnvironmentalRecordStatus,
    default: EnvironmentalRecordStatus.OPEN,
  })
  @IsEnum(EnvironmentalRecordStatus)
  status!: EnvironmentalRecordStatus;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee?: User | null;

  @Column({ name: 'remediation_actions', type: 'jsonb', default: [] })
  remediationActions!: Array<Record<string, any>>;

  @Column({ name: 'community_visible', default: false })
  communityVisible!: boolean;

  @Column({ name: 'private_notes', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  privateNotes?: string | null;

  @Column({ name: 'resolved_at', type: 'timestamp', nullable: true })
  resolvedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
