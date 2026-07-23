import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('revoked_refresh_tokens')
@Index(['tokenHash'], { unique: true })
@Index(['userId'])
@Index(['expiresAt'])
export class RevokedRefreshToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'token_hash', unique: true })
  tokenHash!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId: string | null = null;

  @Column({ name: 'expires_at', type: 'timestamp', nullable: true })
  expiresAt: Date | null = null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
