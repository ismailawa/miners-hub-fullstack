/**
 * Chats API Service
 *
 * Connects to the backend /api/chats endpoints.
 */

import apiClient from './client';

export interface BackendMessage {
  id: string;
  threadId: string;
  senderId: string;
  message?: string;
  text: string;
  read: boolean;
  createdAt: string;
  sender?: { name: string; profileImageUrl?: string };
}

export interface BackendThread {
  threadId: string;
  participant: {
    id: string;
    name: string;
    profileImageUrl?: string;
  };
  latestMessage?: BackendMessage | null;
  unreadCount: number;
}

interface BackendThreadResponse {
  threadId: string;
  participant?: BackendThread['participant'];
  counterparty?: {
    id: string;
    name: string;
    email?: string;
    profileImageUrl?: string;
  } | null;
  latestMessage?: BackendMessage | null;
  unreadCount: number | string;
}

interface BackendPaginatedResponse<T> {
  data: T[];
}

/**
 * Get all chat threads for the current user
 */
export async function getChatThreads(): Promise<BackendThread[]> {
  const response = await apiClient.get<BackendThreadResponse[]>('/api/chats/threads');
  return response.map(normalizeThread);
}

/**
 * Get messages in a specific thread
 */
export async function getChatMessages(threadId: string): Promise<BackendMessage[]> {
  const response = await apiClient.get<BackendPaginatedResponse<BackendMessage> | BackendMessage[]>(
    `/api/chats/threads/${threadId}`,
  );
  const messages = Array.isArray(response) ? response : response.data;
  return messages.map(normalizeMessage);
}

/**
 * Send a message to a user (creates or continues a thread)
 */
export async function sendMessage(recipientId: string, text: string): Promise<BackendMessage> {
  const response = await apiClient.post<BackendMessage>('/api/chats', {
    receiverId: recipientId,
    message: text,
  });
  return normalizeMessage(response);
}

function normalizeMessage(message: BackendMessage): BackendMessage {
  return {
    ...message,
    text: message.text || message.message || '',
  };
}

function normalizeThread(thread: BackendThreadResponse): BackendThread {
  const participant = thread.participant || thread.counterparty;
  return {
    threadId: thread.threadId,
    participant: {
      id: participant?.id || '',
      name: participant?.name || 'Unknown user',
      profileImageUrl: participant?.profileImageUrl,
    },
    latestMessage: thread.latestMessage
      ? normalizeMessage(thread.latestMessage)
      : null,
    unreadCount: Number(thread.unreadCount || 0),
  };
}
