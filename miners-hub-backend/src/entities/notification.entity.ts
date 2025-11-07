import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import {
  IsNotEmpty,
  IsUUID,
  IsString,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { User } from './user.entity';

@Entity('notifications')
@Index(['userId'])
@Index(['read'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id' })
  @IsNotEmpty()
  @IsUUID()
  userId!: string;

  @ManyToOne(() => User, (user) => user.notifications)
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column()
  @IsNotEmpty()
  @IsString()
  title!: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  message!: string;

  @Column({ default: false })
  @IsBoolean()
  read!: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  @IsOptional()
  readAt: Date | null = null;

  @Column({ name: 'notification_type', default: 'info' })
  @IsString()
  notificationType!: 'info' | 'success' | 'warning' | 'error';

  @Column({ type: 'jsonb', nullable: true })
  @IsOptional()
  metadata: Record<string, any> | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
