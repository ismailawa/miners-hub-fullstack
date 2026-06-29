import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ForumPost } from '../entities/forum-post.entity';
import { ForumReply } from '../entities/forum-reply.entity';
import { ForumController } from './forum.controller';
import { ForumService } from './forum.service';

@Module({
  imports: [TypeOrmModule.forFeature([ForumPost, ForumReply])],
  controllers: [ForumController],
  providers: [ForumService],
})
export class ForumModule {}
