import apiClient from './client';
import type { ForumPost, ForumReply } from '../types';

export interface CreateForumPostPayload {
  title: string;
  content: string;
  category: string;
}

export interface CreateForumReplyPayload {
  content: string;
}

export async function getForumPosts(params?: {
  category?: string;
  search?: string;
}): Promise<ForumPost[]> {
  const query = new URLSearchParams();
  if (params?.category && params.category !== 'all') query.append('category', params.category);
  if (params?.search) query.append('search', params.search);
  const queryString = query.toString();
  return apiClient.get<ForumPost[]>(`/api/forum/posts${queryString ? `?${queryString}` : ''}`, { skipAuth: true });
}

export async function getForumPost(id: string): Promise<ForumPost> {
  return apiClient.get<ForumPost>(`/api/forum/posts/${id}`, { skipAuth: true });
}

export async function createForumPost(payload: CreateForumPostPayload): Promise<ForumPost> {
  return apiClient.post<ForumPost>('/api/forum/posts', payload);
}

export async function createForumReply(postId: string, payload: CreateForumReplyPayload): Promise<ForumReply> {
  return apiClient.post<ForumReply>(`/api/forum/posts/${postId}/replies`, payload);
}
