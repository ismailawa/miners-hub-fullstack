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
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { MineSite } from './mine-site.entity';
import { User } from './user.entity';

export enum ComplianceCaseSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum ComplianceCaseStatus {
  OPEN = 'open',
  INSPECTION_SCHEDULED = 'inspection_scheduled',
  ACTION_REQUIRED = 'action_required',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
}

@Entity('compliance_cases')
@Index(['siteId'])
@Index(['subjectUserId'])
@Index(['status'])
@Index(['severity'])
@Index(['dueDate'])
export class ComplianceCase {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'site_id', type: 'uuid' })
  @IsUUID()
  siteId!: string;

  @ManyToOne(() => MineSite, { nullable: false })
  @JoinColumn({ name: 'site_id' })
  site!: MineSite;

  @Column({ name: 'subject_user_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  subjectUserId?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'subject_user_id' })
  subjectUser?: User | null;

  @Column({ name: 'case_type' })
  @IsString()
  caseType!: string;

  @Column({
    type: 'enum',
    enum: ComplianceCaseSeverity,
    default: ComplianceCaseSeverity.MEDIUM,
  })
  @IsEnum(ComplianceCaseSeverity)
  severity!: ComplianceCaseSeverity;

  @Column({
    type: 'enum',
    enum: ComplianceCaseStatus,
    default: ComplianceCaseStatus.OPEN,
  })
  @IsEnum(ComplianceCaseStatus)
  status!: ComplianceCaseStatus;

  @Column({ name: 'assigned_to', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  assignedTo?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'assigned_to' })
  assignee?: User | null;

  @Column({ type: 'text' })
  @IsString()
  findings!: string;

  @Column({ name: 'required_actions', type: 'jsonb', nullable: true })
  requiredActions?: Array<Record<string, any>> | null;

  @Column({ name: 'due_date', type: 'date', nullable: true })
  dueDate?: string | null;

  @Column({ name: 'inspection_scheduled_at', type: 'timestamp', nullable: true })
  inspectionScheduledAt?: Date | null;

  @Column({ name: 'inspector_name', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  inspectorName?: string | null;

  @Column({ name: 'inspection_notes', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  inspectionNotes?: string | null;

  @Column({ name: 'closed_at', type: 'timestamp', nullable: true })
  closedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
