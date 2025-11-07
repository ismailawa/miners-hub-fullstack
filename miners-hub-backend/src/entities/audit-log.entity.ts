import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsUUID,
  IsOptional,
  IsJSON,
} from 'class-validator';

@Entity('audit_logs')
@Index(['userId'])
@Index(['action'])
@Index(['timestamp'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @Column()
  @IsNotEmpty()
  @IsString()
  action!: string;

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  @IsJSON()
  metadata: Record<string, any> | null = null;

  @Column({ name: 'ip_address', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  ipAddress: string | null = null;

  @Column({ name: 'user_agent', type: 'text', nullable: true })
  @IsOptional()
  @IsString()
  userAgent: string | null = null;

  @CreateDateColumn({ name: 'timestamp' })
  timestamp!: Date;
}
