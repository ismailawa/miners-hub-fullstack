import apiClient from './client';
import type { Event } from '../types';

export interface EventPayload {
  title: string;
  description?: string;
  date: string;
  location: string;
  imageUrl: string;
  registrationUrl?: string;
  featured?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export async function getUpcomingEvents(limit = 6): Promise<Event[]> {
  return apiClient.get<Event[]>(`/api/events?limit=${limit}`, { skipAuth: true });
}
