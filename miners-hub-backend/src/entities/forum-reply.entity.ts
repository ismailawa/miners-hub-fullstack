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
import { ForumPost } from './forum-post.entity';

@Entity('forum_replies')
@Index('IDX_forum_replies_post_id', ['postId'])
@Index('IDX_forum_replies_created_at', ['createdAt'])
export class ForumReply {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'post_id' })
  postId!: string;

  @ManyToOne(() => ForumPost, (post) => post.replies, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'post_id' })
  post!: ForumPost;

  @Column({ name: 'author_id', nullable: true })
  authorId?: string;

  @Column({ name: 'author_name' })
  authorName!: string;

  @Column({ type: 'text' })
  content!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}
