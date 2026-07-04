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
  latestMessage?: BackendMessage;
  unreadCount: number;
}

interface BackendPaginatedResponse<T> {
  data: T[];
}

/**
 * Get all chat threads for the current user
 */
export async function getChatThreads(): Promise<BackendThread[]> {
  return apiClient.get<BackendThread[]>('/api/chats/threads');
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
