import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { ChatsService } from './chats.service';

describe('ChatsService', () => {
  function createService() {
    const chatRepository = {
      create: jest.fn((input) => input),
      save: jest.fn(async (input) => ({
        id: 'message-1',
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        ...input,
      })),
      find: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    const userRepository = {
      findOne: jest.fn(),
    };

    return {
      service: new ChatsService(chatRepository as any, userRepository as any),
      chatRepository,
      userRepository,
    };
  }

  it('rejects messages to self', async () => {
    const { service } = createService();

    await expect(
      service.sendMessage('user-1', {
        receiverId: 'user-1',
        message: 'hello',
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('rejects messages to missing receivers', async () => {
    const { service, userRepository } = createService();
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.sendMessage('user-1', {
        receiverId: 'user-2',
        message: 'hello',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('creates deterministic thread ids and serializes text', async () => {
    const { service, userRepository, chatRepository } = createService();
    userRepository.findOne.mockResolvedValue({ id: 'user-a' });

    const saved = await service.sendMessage('user-b', {
      receiverId: 'user-a',
      message: 'hello',
    });

    expect(chatRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        senderId: 'user-b',
        receiverId: 'user-a',
        threadId: 'user-a--user-b',
        message: 'hello',
      }),
    );
    expect((saved as any).text).toBe('hello');
  });

  it('lists received threads with latest message, counterparty, and unread count', async () => {
    const { service, chatRepository } = createService();
    chatRepository.find.mockResolvedValue([
      {
        id: 'message-2',
        threadId: 'investor-1--miner-1',
        senderId: 'investor-1',
        receiverId: 'miner-1',
        message: 'Can we discuss this listing?',
        read: false,
        createdAt: new Date('2026-01-02T00:00:00.000Z'),
        sender: {
          id: 'investor-1',
          name: 'Investor One',
          email: 'investor@example.com',
          profileImageUrl: 'https://example.com/investor.png',
        },
        receiver: {
          id: 'miner-1',
          name: 'Miner One',
          email: 'miner@example.com',
        },
      },
      {
        id: 'message-1',
        threadId: 'investor-1--miner-1',
        senderId: 'miner-1',
        receiverId: 'investor-1',
        message: 'Sure',
        read: true,
        createdAt: new Date('2026-01-01T00:00:00.000Z'),
        sender: {
          id: 'miner-1',
          name: 'Miner One',
          email: 'miner@example.com',
        },
        receiver: {
          id: 'investor-1',
          name: 'Investor One',
          email: 'investor@example.com',
          profileImageUrl: 'https://example.com/investor.png',
        },
      },
    ]);

    const threads = await service.getThreads('miner-1');

    expect(chatRepository.find).toHaveBeenCalledWith({
      where: [{ senderId: 'miner-1' }, { receiverId: 'miner-1' }],
      relations: ['sender', 'receiver'],
      order: { createdAt: 'DESC' },
    });
    expect(threads).toEqual([
      expect.objectContaining({
        threadId: 'investor-1--miner-1',
        unreadCount: 1,
        latestMessage: expect.objectContaining({
          id: 'message-2',
          text: 'Can we discuss this listing?',
        }),
        counterparty: {
          id: 'investor-1',
          name: 'Investor One',
          email: 'investor@example.com',
          profileImageUrl: 'https://example.com/investor.png',
        },
      }),
    ]);
  });

  it('returns an empty page for a valid thread with no messages yet', async () => {
    const { service, chatRepository, userRepository } = createService();
    chatRepository.findOne.mockResolvedValue(null);
    userRepository.findOne.mockResolvedValue({ id: 'user-b' });

    const result = await service.getMessages('user-a--user-b', 'user-a');

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-b' },
    });
    expect(result).toEqual({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
      totalPages: 0,
    });
    expect(chatRepository.update).not.toHaveBeenCalled();
    expect(chatRepository.createQueryBuilder).not.toHaveBeenCalled();
  });

  it('rejects missing threads that do not include the current user', async () => {
    const { service, chatRepository, userRepository } = createService();
    chatRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getMessages('user-a--user-b', 'user-c'),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(userRepository.findOne).not.toHaveBeenCalled();
  });

  it('rejects empty threads when the other participant does not exist', async () => {
    const { service, chatRepository, userRepository } = createService();
    chatRepository.findOne.mockResolvedValue(null);
    userRepository.findOne.mockResolvedValue(null);

    await expect(
      service.getMessages('user-a--user-b', 'user-a'),
    ).rejects.toBeInstanceOf(NotFoundException);
  });
});
