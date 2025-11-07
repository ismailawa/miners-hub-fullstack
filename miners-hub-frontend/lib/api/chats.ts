/**
 * Chats API Service
 * Handles all chat-related API calls
 */

import { get, post } from "./client";
import type { Chat } from "@/lib/types";

// Re-export for convenience
export type { Chat } from "@/lib/types";

// Chat is the message type (backend uses Chat entity for messages)
export type Message = Chat;

/**
 * Get conversations
 */
export async function getConversations(): Promise<Chat[]> {
  return get<Chat[]>("/chats");
}

/**
 * Get messages for a conversation
 */
export async function getMessages(chatId: string): Promise<Message[]> {
  return get<Message[]>(`/chats/${chatId}/messages`);
}

/**
 * Send message
 */
export async function sendMessage(
  chatId: string,
  content: string
): Promise<Message> {
  return post<Message>(`/chats/${chatId}/messages`, { content });
}

