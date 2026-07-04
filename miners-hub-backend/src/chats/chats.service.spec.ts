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
});
