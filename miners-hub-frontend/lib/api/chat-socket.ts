import { io, Socket } from 'socket.io-client';
import { getAccessToken } from './token';
import type { BackendMessage } from './chats';

type ChatSocket = Socket<{
  'chat:message': (message: BackendMessage) => void;
  'chat:thread:update': (payload: { threadId: string; latestMessage: BackendMessage }) => void;
  'chat:error': (payload: { message: string }) => void;
}, {
  'chat:join': (payload: { threadId: string }, ack?: (response: { threadId: string }) => void) => void;
  'chat:leave': (payload: { threadId: string }, ack?: (response: { threadId: string }) => void) => void;
  'chat:send': (
    payload: { receiverId: string; message: string },
    ack?: (response: BackendMessage) => void,
  ) => void;
}>;

let chatSocket: ChatSocket | null = null;

function getSocketBaseUrl(): string {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  return baseUrl.replace(/\/api\/?$/, '');
}

export function connectChatSocket(): ChatSocket | null {
  const token = getAccessToken();
  if (!token) return null;

  if (chatSocket) {
    chatSocket.auth = { token };
    if (!chatSocket.connected) chatSocket.connect();
    return chatSocket;
  }

  chatSocket = io(`${getSocketBaseUrl()}/chats`, {
    auth: { token },
    autoConnect: true,
    transports: ['websocket', 'polling'],
  });

  return chatSocket;
}

export function joinThread(threadId: string): Promise<{ threadId: string }> {
  const socket = connectChatSocket();
  if (!socket) return Promise.reject(new Error('Chat socket is not authenticated.'));
  return socket.timeout(5000).emitWithAck('chat:join', { threadId });
}

export function leaveThread(threadId: string): Promise<{ threadId: string }> {
  if (!chatSocket) return Promise.resolve({ threadId });
  return chatSocket.timeout(5000).emitWithAck('chat:leave', { threadId });
}

export function sendSocketMessage(receiverId: string, message: string): Promise<BackendMessage> {
  const socket = connectChatSocket();
  if (!socket || !socket.connected) {
    return Promise.reject(new Error('Chat socket is not connected.'));
  }
  return socket.timeout(5000).emitWithAck('chat:send', { receiverId, message });
}

export function onChatMessage(listener: (message: BackendMessage) => void) {
  const socket = connectChatSocket();
  socket?.on('chat:message', listener);
  return () => socket?.off('chat:message', listener);
}

export function onChatError(listener: (payload: { message: string }) => void) {
  const socket = connectChatSocket();
  socket?.on('chat:error', listener);
  return () => socket?.off('chat:error', listener);
}

export function isChatSocketConnected(): boolean {
  return Boolean(chatSocket?.connected);
}
