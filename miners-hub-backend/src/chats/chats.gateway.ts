import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from '@nestjs/websockets';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { UsersService } from '../users/users.service';
import { ChatsService } from './chats.service';
import { SendMessageDto } from './chats.dto';

type SocketEventMap = Record<string, (...args: unknown[]) => void>;

type AuthenticatedSocket = Socket<
  SocketEventMap,
  SocketEventMap,
  SocketEventMap,
  {
    userId?: string;
  }
>;

type ChatJwtPayload = {
  sub: string;
};

@WebSocketGateway({
  namespace: '/chats',
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly chatsService: ChatsService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const token = this.getTokenFromHandshake(client.handshake);
      if (!token) throw new WsException('Authentication token is required.');

      const payload = await this.jwtService.verifyAsync<ChatJwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'secret',
      });
      const user = await this.usersService.findById(payload.sub);
      if (!user) throw new WsException('Invalid authentication token.');

      client.data.userId = user.id;
      await client.join(this.userRoom(user.id));
    } catch {
      client.emit('chat:error', { message: 'Unauthorized chat connection.' });
      client.disconnect(true);
    }
  }

  @SubscribeMessage('chat:join')
  async handleJoin(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { threadId?: string },
  ) {
    const userId = this.requireUserId(client);
    const threadId = body?.threadId;
    if (!threadId || !this.isThreadMember(threadId, userId)) {
      client.emit('chat:error', {
        message: 'You cannot join this chat thread.',
      });
      throw new WsException('You cannot join this chat thread.');
    }

    await client.join(this.threadRoom(threadId));
    return { threadId };
  }

  @SubscribeMessage('chat:leave')
  async handleLeave(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: { threadId?: string },
  ) {
    const userId = this.requireUserId(client);
    const threadId = body?.threadId;
    if (!threadId || !this.isThreadMember(threadId, userId)) {
      client.emit('chat:error', {
        message: 'You cannot leave this chat thread.',
      });
      throw new WsException('You cannot leave this chat thread.');
    }

    await client.leave(this.threadRoom(threadId));
    return { threadId };
  }

  @SubscribeMessage('chat:send')
  async handleSend(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() body: SendMessageDto,
  ) {
    const senderId = this.requireUserId(client);
    let saved;
    try {
      saved = await this.chatsService.sendMessage(senderId, body);
    } catch (error) {
      client.emit('chat:error', {
        message:
          error instanceof Error ? error.message : 'Failed to send message.',
      });
      throw error;
    }
    const threadId = saved.threadId;

    this.server.to(this.threadRoom(threadId)).emit('chat:message', saved);
    this.server.to(this.userRoom(senderId)).emit('chat:thread:update', {
      threadId,
      latestMessage: saved,
    });
    this.server.to(this.userRoom(body.receiverId)).emit('chat:thread:update', {
      threadId,
      latestMessage: saved,
    });

    return saved;
  }

  private getTokenFromHandshake(
    handshake: AuthenticatedSocket['handshake'],
  ): string | null {
    const authToken = this.readStringProperty(handshake.auth, 'token');
    if (typeof authToken === 'string' && authToken.trim()) return authToken;

    const bearer = handshake.headers.authorization;
    if (typeof bearer === 'string' && bearer.startsWith('Bearer ')) {
      return bearer.slice('Bearer '.length);
    }

    return null;
  }

  private readStringProperty(input: unknown, key: string): string | null {
    if (typeof input !== 'object' || input === null || !(key in input)) {
      return null;
    }
    const value = (input as Record<string, unknown>)[key];
    return typeof value === 'string' ? value : null;
  }

  private requireUserId(client: AuthenticatedSocket): string {
    if (!client.data.userId) {
      throw new WsException('Unauthorized chat connection.');
    }
    return client.data.userId;
  }

  private isThreadMember(threadId: string, userId: string): boolean {
    return threadId.split('--').includes(userId);
  }

  private threadRoom(threadId: string): string {
    return `thread:${threadId}`;
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }
}
