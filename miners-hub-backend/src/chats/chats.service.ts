import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { SendMessageDto } from './chats.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

/**
 * Deterministic thread ID: sort the two UUIDs lexicographically so the
 * same pair always produces the same threadId regardless of who initiates.
 */
function buildThreadId(a: string, b: string): string {
  return [a, b].sort().join('--');
}

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
  ) {}

  async sendMessage(senderId: string, dto: SendMessageDto): Promise<Chat> {
    if (senderId === dto.receiverId) {
      throw new ForbiddenException('Cannot send a message to yourself.');
    }

    const threadId = buildThreadId(senderId, dto.receiverId);

    const chat = this.chatRepository.create({
      senderId,
      receiverId: dto.receiverId,
      threadId,
      message: dto.message,
      read: false,
    });

    return this.chatRepository.save(chat);
  }

  /**
   * List all unique threads for a user — returns latest message per thread
   * plus unread count.
   */
  async getThreads(userId: string): Promise<any[]> {
    // Use a raw query to get the latest message per thread + unread count
    const threads = await this.chatRepository
      .createQueryBuilder('chat')
      .select('chat.threadId', 'threadId')
      .addSelect('MAX(chat.createdAt)', 'lastMessageAt')
      .addSelect(
        `SUM(CASE WHEN chat.receiverId = :userId AND chat.read = false THEN 1 ELSE 0 END)`,
        'unreadCount',
      )
      .where('chat.senderId = :userId OR chat.receiverId = :userId', { userId })
      .groupBy('chat.threadId')
      .orderBy('lastMessageAt', 'DESC')
      .setParameter('userId', userId)
      .getRawMany();

    // Enrich each thread with the latest message content
    const enriched = await Promise.all(
      threads.map(async (t) => {
        const latest = await this.chatRepository.findOne({
          where: { threadId: t.threadId },
          relations: ['sender', 'receiver'],
          order: { createdAt: 'DESC' },
        });
        const counterparty =
          latest?.senderId === userId ? latest?.receiver : latest?.sender;
        return {
          threadId: t.threadId,
          lastMessageAt: t.lastMessageAt,
          unreadCount: Number(t.unreadCount),
          latestMessage: latest?.message,
          counterparty: counterparty
            ? { id: counterparty.id, name: counterparty.name, email: counterparty.email }
            : null,
        };
      }),
    );

    return enriched;
  }

  async getMessages(
    threadId: string,
    userId: string,
    pagination: PaginationDto = new PaginationDto(),
  ) {
    // Verify the user belongs to this thread
    const threadCheck = await this.chatRepository.findOne({
      where: { threadId },
    });
    if (!threadCheck) throw new NotFoundException('Thread not found.');
    if (
      threadCheck.senderId !== userId &&
      threadCheck.receiverId !== userId
    ) {
      throw new ForbiddenException('Access denied.');
    }

    // Mark all unread messages in this thread as read for this user
    await this.chatRepository.update(
      { threadId, receiverId: userId, read: false },
      { read: true, readAt: new Date() },
    );

    const [data, total] = await this.chatRepository
      .createQueryBuilder('chat')
      .leftJoinAndSelect('chat.sender', 'sender')
      .where('chat.threadId = :threadId', { threadId })
      .orderBy('chat.createdAt', 'ASC')
      .skip(pagination.offset)
      .take(pagination.limit)
      .getManyAndCount();

    return paginate(data, total, pagination);
  }

  async markRead(id: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id } });
    if (!chat) throw new NotFoundException('Message not found.');
    if (chat.receiverId !== userId) {
      throw new ForbiddenException('Only the receiver can mark a message as read.');
    }
    chat.read = true;
    chat.readAt = new Date();
    return this.chatRepository.save(chat);
  }
}
