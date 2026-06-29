import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ForumPost } from '../entities/forum-post.entity';
import { ForumReply } from '../entities/forum-reply.entity';
import { User } from '../entities/user.entity';
import {
  CreateForumPostDto,
  CreateForumReplyDto,
  ForumFilterDto,
} from './forum.dto';

@Injectable()
export class ForumService implements OnModuleInit {
  constructor(
    @InjectRepository(ForumPost)
    private readonly postRepository: Repository<ForumPost>,
    @InjectRepository(ForumReply)
    private readonly replyRepository: Repository<ForumReply>,
  ) {}

  async onModuleInit() {
    const count = await this.postRepository.count();
    if (count > 0) return;

    const firstPost = await this.postRepository.save(
      this.postRepository.create({
        authorName: 'Bello Mining Corp',
        title: 'Best practices for managing tailings?',
        content:
          'We are looking to improve our environmental footprint and would love to hear how other mid-sized operations are managing their tailings.',
        category: 'general',
        tags: ['best', 'practices', 'managing', 'tailings'],
      }),
    );

    await this.replyRepository.save(
      this.replyRepository.create({
        postId: firstPost.id,
        authorName: 'John Doe',
        content:
          'Have you looked into dry stacking? It can reduce water usage and make containment easier to monitor.',
      }),
    );

    await this.postRepository.save([
      this.postRepository.create({
        authorName: 'John Doe',
        title: 'Seeking investment in a promising lithium deposit in Nasarawa',
        content:
          'Our geological surveys indicate a significant lithium deposit. We have the initial exploration license and are seeking partners for the next phase.',
        category: 'investment',
        tags: [
          'seeking',
          'investment',
          'promising',
          'lithium',
          'deposit',
          'nasarawa',
        ],
      }),
      this.postRepository.create({
        authorName: 'Adewale Resources',
        title: 'Reliable suppliers for small-scale crushing equipment',
        content:
          'Can anyone recommend reliable vendors for small-scale crushing and screening equipment suitable for limestone operations?',
        category: 'equipment',
        tags: [
          'reliable',
          'suppliers',
          'small',
          'scale',
          'crushing',
          'equipment',
        ],
      }),
    ]);
  }

  async findAll(filters: ForumFilterDto = {}) {
    const qb = this.postRepository
      .createQueryBuilder('post')
      .leftJoinAndSelect('post.replies', 'reply')
      .orderBy('post.createdAt', 'DESC')
      .addOrderBy('reply.createdAt', 'ASC');

    if (filters.category && filters.category !== 'all') {
      qb.andWhere('post.category = :category', { category: filters.category });
    }

    if (filters.search) {
      qb.andWhere(
        '(post.title ILIKE :search OR post.content ILIKE :search OR EXISTS (SELECT 1 FROM unnest(post.tags) AS tag WHERE tag ILIKE :search))',
        { search: `%${filters.search}%` },
      );
    }

    const posts = await qb.getMany();
    return posts.map((post) => this.toPostDto(post));
  }

  async findOne(id: string) {
    const post = await this.postRepository.findOne({
      where: { id },
      relations: ['replies'],
      order: { replies: { createdAt: 'ASC' } },
    });

    if (!post) throw new NotFoundException('Forum post not found');
    return this.toPostDto(post);
  }

  async createPost(user: User, dto: CreateForumPostDto) {
    const post = this.postRepository.create({
      authorId: user.id,
      authorName: user.name || user.email,
      title: dto.title,
      content: dto.content,
      category: dto.category || 'general',
      tags: this.generateTags(dto.title, dto.content),
    });

    const saved = await this.postRepository.save(post);
    return this.toPostDto({ ...saved, replies: [] });
  }

  async createReply(postId: string, user: User, dto: CreateForumReplyDto) {
    const post = await this.postRepository.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Forum post not found');

    const reply = await this.replyRepository.save(
      this.replyRepository.create({
        postId,
        authorId: user.id,
        authorName: user.name || user.email,
        content: dto.content,
      }),
    );

    return this.toReplyDto(reply);
  }

  private generateTags(title: string, content: string) {
    return Array.from(
      new Set(
        `${title} ${content}`
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .split(/\s+/)
          .filter((word) => word.length > 3)
          .slice(0, 8),
      ),
    );
  }

  private toPostDto(post: ForumPost) {
    const createdAt =
      post.createdAt instanceof Date
        ? post.createdAt.toISOString()
        : post.createdAt;
    return {
      id: post.id,
      authorId: post.authorId || 'system',
      authorName: post.authorName,
      title: post.title,
      content: post.content,
      category: post.category,
      date: createdAt,
      createdAt,
      tags: post.tags || [],
      replies: (post.replies || []).map((reply) => this.toReplyDto(reply)),
    };
  }

  private toReplyDto(reply: ForumReply) {
    const createdAt =
      reply.createdAt instanceof Date
        ? reply.createdAt.toISOString()
        : reply.createdAt;
    return {
      id: reply.id,
      postId: reply.postId,
      authorId: reply.authorId || 'system',
      authorName: reply.authorName,
      content: reply.content,
      date: createdAt,
      createdAt,
    };
  }
}
