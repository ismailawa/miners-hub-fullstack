import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { User } from './user.entity';
import { LabResult } from './lab-result.entity';

export enum LaboratoryPartnerStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
}

@Entity('laboratory_partners')
@Index(['userId'])
@Index(['status'])
export class LaboratoryPartner {
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

  @Column({ name: 'accreditation_number', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  accreditationNumber?: string | null;

  @Column({ type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  address?: string | null;

  @Column({
    type: 'enum',
    enum: LaboratoryPartnerStatus,
    default: LaboratoryPartnerStatus.PENDING,
  })
  @IsEnum(LaboratoryPartnerStatus)
  status!: LaboratoryPartnerStatus;

  @Column({ name: 'contact_email', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  contactEmail?: string | null;

  @Column({ name: 'contact_phone', type: 'varchar', nullable: true })
  @IsOptional()
  @IsString()
  contactPhone?: string | null;

  @OneToMany(() => LabResult, (result) => result.lab)
  labResults!: LabResult[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
