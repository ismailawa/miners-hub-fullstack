import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ForumReply } from './forum-reply.entity';

@Entity('forum_posts')
@Index('IDX_forum_posts_category', ['category'])
@Index('IDX_forum_posts_created_at', ['createdAt'])
export class ForumPost {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'author_id', nullable: true })
  authorId?: string;

  @Column({ name: 'author_name' })
  authorName!: string;

  @Column()
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: 'general' })
  category!: string;

  @Column({ type: 'text', array: true, default: [] })
  tags!: string[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => ForumReply, (reply) => reply.post, { cascade: true })
  replies!: ForumReply[];
}
