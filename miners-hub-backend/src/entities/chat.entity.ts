import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { IsNotEmpty, IsUUID, IsString, IsOptional } from 'class-validator';
import { User } from './user.entity';

@Entity('chats')
@Index(['senderId'])
@Index(['receiverId'])
@Index(['threadId'])
@Index(['createdAt'])
export class Chat {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'sender_id' })
  @IsNotEmpty()
  @IsUUID()
  senderId!: string;

  @ManyToOne(() => User, (user) => user.sentChats)
  @JoinColumn({ name: 'sender_id' })
  sender!: User;

  @Column({ name: 'receiver_id' })
  @IsNotEmpty()
  @IsUUID()
  receiverId!: string;

  @ManyToOne(() => User, (user) => user.receivedChats)
  @JoinColumn({ name: 'receiver_id' })
  receiver!: User;

  @Column({ name: 'thread_id' })
  @IsNotEmpty()
  @IsUUID()
  threadId!: string;

  @Column({ type: 'text' })
  @IsNotEmpty()
  @IsString()
  message!: string;

  @Column({ default: false })
  read!: boolean;

  @Column({ name: 'read_at', type: 'timestamp', nullable: true })
  @IsOptional()
  readAt: Date | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
