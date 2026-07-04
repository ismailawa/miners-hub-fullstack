import { WsException } from '@nestjs/websockets';
import { ChatsGateway } from './chats.gateway';

describe('ChatsGateway', () => {
  function createGateway() {
    const chatsService = {
      sendMessage: jest.fn(),
    };
    const usersService = {
      findById: jest.fn(),
    };
    const jwtService = {
      verifyAsync: jest.fn(),
    };
    const configService = {
      get: jest.fn().mockReturnValue('test-secret'),
    };
    const gateway = new ChatsGateway(
      chatsService as any,
      usersService as any,
      jwtService as any,
      configService as any,
    );
    gateway.server = {
      to: jest.fn().mockReturnThis(),
      emit: jest.fn(),
    } as any;

    return { gateway, chatsService, usersService, jwtService };
  }

  function createClient(userId?: string) {
    return {
      data: { userId },
      handshake: {
        auth: { token: 'token' },
        headers: {},
      },
      join: jest.fn().mockResolvedValue(undefined),
      leave: jest.fn().mockResolvedValue(undefined),
      emit: jest.fn(),
      disconnect: jest.fn(),
    };
  }

  it('disconnects unauthenticated sockets', async () => {
    const { gateway } = createGateway();
    const client = createClient();
    client.handshake.auth = {};

    await gateway.handleConnection(client as any);

    expect(client.emit).toHaveBeenCalledWith('chat:error', {
      message: 'Unauthorized chat connection.',
    });
    expect(client.disconnect).toHaveBeenCalledWith(true);
  });

  it('joins the authenticated user room on connect', async () => {
    const { gateway, jwtService, usersService } = createGateway();
    const client = createClient();
    jwtService.verifyAsync.mockResolvedValue({ sub: 'user-1' });
    usersService.findById.mockResolvedValue({ id: 'user-1' });

    await gateway.handleConnection(client as any);

    expect(client.data.userId).toBe('user-1');
    expect(client.join).toHaveBeenCalledWith('user:user-1');
  });

  it('rejects joining a thread that does not include the current user', async () => {
    const { gateway } = createGateway();
    const client = createClient('user-1');

    await expect(
      gateway.handleJoin(client as any, { threadId: 'user-2--user-3' }),
    ).rejects.toBeInstanceOf(WsException);
  });

  it('persists socket messages and emits to the thread room', async () => {
    const { gateway, chatsService } = createGateway();
    const client = createClient('user-1');
    const saved = {
      id: 'message-1',
      senderId: 'user-1',
      receiverId: 'user-2',
      threadId: 'user-1--user-2',
      text: 'hello',
      message: 'hello',
      read: false,
      createdAt: new Date('2026-01-01T00:00:00.000Z'),
    };
    chatsService.sendMessage.mockResolvedValue(saved);

    const result = await gateway.handleSend(client as any, {
      receiverId: 'user-2',
      message: 'hello',
    });

    expect(chatsService.sendMessage).toHaveBeenCalledWith('user-1', {
      receiverId: 'user-2',
      message: 'hello',
    });
    expect(gateway.server.to).toHaveBeenCalledWith('thread:user-1--user-2');
    expect(gateway.server.emit).toHaveBeenCalledWith('chat:message', saved);
    expect(result).toBe(saved);
  });
});
