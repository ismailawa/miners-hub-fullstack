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
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { LaboratoryPartner } from './laboratory-partner.entity';
import { Listing } from './listing.entity';
import { ProductionReport } from './production-report.entity';
import { User } from './user.entity';

export enum LabResultStatus {
  REQUESTED = 'requested',
  SUBMITTED = 'submitted',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

@Entity('lab_results')
@Index(['labId'])
@Index(['requesterId'])
@Index(['listingId'])
@Index(['productionReportId'])
@Index(['mineralPassportId'])
@Index(['status'])
@Index(['sampleReference'])
export class LabResult {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'lab_id', type: 'uuid' })
  @IsUUID()
  labId!: string;

  @ManyToOne(() => LaboratoryPartner, (lab) => lab.labResults)
  @JoinColumn({ name: 'lab_id' })
  lab!: LaboratoryPartner;

  @Column({ name: 'requester_id', type: 'uuid' })
  @IsUUID()
  requesterId!: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'requester_id' })
  requester!: User;

  @Column({ name: 'listing_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  listingId?: string | null;

  @ManyToOne(() => Listing, { nullable: true })
  @JoinColumn({ name: 'listing_id' })
  listing?: Listing | null;

  @Column({ name: 'production_report_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  productionReportId?: string | null;

  @ManyToOne(() => ProductionReport, { nullable: true })
  @JoinColumn({ name: 'production_report_id' })
  productionReport?: ProductionReport | null;

  @Column({ name: 'mineral_passport_id', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  mineralPassportId?: string | null;

  @Column({ name: 'sample_reference' })
  @IsNotEmpty()
  @IsString()
  sampleReference!: string;

  @Column({ name: 'mineral_type' })
  @IsNotEmpty()
  @IsString()
  mineralType!: string;

  @Column({ type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  grade?: string | null;

  @Column({ name: 'assay_value', type: 'decimal', precision: 10, scale: 3, nullable: true })
  @IsOptional()
  @IsNumber()
  assayValue?: number | null;

  @Column({ name: 'assay_unit', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  assayUnit?: string | null;

  @Column({ name: 'result_payload', type: 'jsonb', default: {} })
  @IsObject()
  resultPayload!: Record<string, any>;

  @Column({ name: 'certificate_url', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  certificateUrl?: string | null;

  @Column({
    type: 'enum',
    enum: LabResultStatus,
    default: LabResultStatus.REQUESTED,
  })
  @IsEnum(LabResultStatus)
  status!: LabResultStatus;

  @Column({ name: 'review_notes', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  reviewNotes?: string | null;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  @IsOptional()
  @IsUUID()
  verifiedBy?: string | null;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'verified_by' })
  verifier?: User | null;

  @Column({ name: 'verified_at', type: 'timestamp', nullable: true })
  verifiedAt?: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
