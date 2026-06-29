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
  lastMessage?: BackendMessage;
  unreadCount: number;
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
  return apiClient.get<BackendMessage[]>(`/api/chats/${threadId}/messages`);
}

/**
 * Send a message to a user (creates or continues a thread)
 */
export async function sendMessage(recipientId: string, text: string): Promise<BackendMessage> {
  return apiClient.post<BackendMessage>('/api/chats', { recipientId, text });
}
