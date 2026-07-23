import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chat } from '../entities/chat.entity';
import { User } from '../entities/user.entity';
import { SendMessageDto } from './chats.dto';
import { PaginationDto, paginate } from '../common/dto/pagination.dto';

/**
 * Deterministic thread ID: sort the two UUIDs lexicographically so the
 * same pair always produces the same threadId regardless of who initiates.
 */
function buildThreadId(a: string, b: string): string {
  return [a, b].sort().join('--');
}

function parseThreadId(threadId: string): [string, string] | null {
  const [firstUserId, secondUserId, ...rest] = threadId.split('--');
  if (!firstUserId || !secondUserId || rest.length > 0) return null;
  return [firstUserId, secondUserId];
}

@Injectable()
export class ChatsService {
  constructor(
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async sendMessage(senderId: string, dto: SendMessageDto): Promise<Chat> {
    if (senderId === dto.receiverId) {
      throw new ForbiddenException('Cannot send a message to yourself.');
    }

    const receiver = await this.userRepository.findOne({
      where: { id: dto.receiverId },
    });
    if (!receiver) throw new NotFoundException('Receiver not found.');

    const threadId = buildThreadId(senderId, dto.receiverId);

    const chat = this.chatRepository.create({
      senderId,
      receiverId: dto.receiverId,
      threadId,
      message: dto.message,
      read: false,
    });

    return this.serializeMessage(await this.chatRepository.save(chat));
  }

  /**
   * List all unique threads for a user — returns latest message per thread
   * plus unread count.
   */
  async getThreads(userId: string): Promise<any[]> {
    const messages = await this.chatRepository.find({
      where: [{ senderId: userId }, { receiverId: userId }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });

    const threads = new Map<
      string,
      { latest: Chat; unreadCount: number; lastMessageAt: Date }
    >();

    for (const message of messages) {
      const existing = threads.get(message.threadId);
      const unreadIncrement =
        message.receiverId === userId && !message.read ? 1 : 0;

      if (!existing) {
        threads.set(message.threadId, {
          latest: message,
          unreadCount: unreadIncrement,
          lastMessageAt: message.createdAt,
        });
        continue;
      }

      existing.unreadCount += unreadIncrement;
    }

    return Array.from(threads.entries()).map(([threadId, thread]) => {
      const counterparty =
        thread.latest.senderId === userId
          ? thread.latest.receiver
          : thread.latest.sender;

      return {
        threadId,
        lastMessageAt: thread.lastMessageAt,
        unreadCount: thread.unreadCount,
        latestMessage: this.serializeMessage(thread.latest),
        counterparty: counterparty
          ? {
              id: counterparty.id,
              name: counterparty.name,
              email: counterparty.email,
              profileImageUrl: counterparty.profileImageUrl,
            }
          : null,
      };
    });
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
    if (!threadCheck) {
      const participants = parseThreadId(threadId);
      if (!participants?.includes(userId)) {
        throw new NotFoundException('Thread not found.');
      }

      const otherUserId = participants.find((id) => id !== userId);
      const otherUser = otherUserId
        ? await this.userRepository.findOne({ where: { id: otherUserId } })
        : null;
      if (!otherUser) throw new NotFoundException('Thread not found.');

      return paginate([], 0, pagination);
    }
    if (threadCheck.senderId !== userId && threadCheck.receiverId !== userId) {
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

    return paginate(
      data.map((message) => this.serializeMessage(message)),
      total,
      pagination,
    );
  }

  async markRead(id: string, userId: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({ where: { id } });
    if (!chat) throw new NotFoundException('Message not found.');
    if (chat.receiverId !== userId) {
      throw new ForbiddenException(
        'Only the receiver can mark a message as read.',
      );
    }
    chat.read = true;
    chat.readAt = new Date();
    return this.serializeMessage(await this.chatRepository.save(chat));
  }

  private serializeMessage(chat: Chat): Chat {
    return {
      ...chat,
      text: chat.message,
    } as Chat;
  }
}
