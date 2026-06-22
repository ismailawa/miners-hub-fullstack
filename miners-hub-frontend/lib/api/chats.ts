/**
 * Chats API Service
 * 
 * Placeholder service for chat/messaging endpoints.
 * To be implemented in future stories.
 */

import apiClient from './client';
import type { Chat, ChatMessage } from '../types';

/**
 * Get all chat threads
 * TODO: Implement when chat endpoints are available
 */
export async function getChatThreads(): Promise<Chat[]> {
  return apiClient.get<Chat[]>('/api/chats');
}

/**
 * Get chat messages for a thread
 * TODO: Implement when chat endpoints are available
 */
export async function getChatMessages(threadId: string): Promise<ChatMessage[]> {
  return apiClient.get<ChatMessage[]>(`/api/chats/${threadId}/messages`);
}

/**
 * Send message
 * TODO: Implement when chat endpoints are available
 */
export async function sendMessage(
  threadId: string,
  message: string,
): Promise<ChatMessage> {
  return apiClient.post<ChatMessage>(`/api/chats/${threadId}/messages`, { text: message });
}

/**
 * Create new chat thread
 * TODO: Implement when chat endpoints are available
 */
export async function createChatThread(participantId: string): Promise<Chat> {
  return apiClient.post<Chat>('/api/chats', { participantId });
}

