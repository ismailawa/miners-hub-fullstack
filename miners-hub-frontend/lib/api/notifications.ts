/**
 * Notifications API Service
 * 
 * Refactored to use centralized API client.
 * Maintains backward compatibility with existing code.
 */

import apiClient from './client';
import type { ApiError } from './errors';
import type { Notification, NotificationType } from '../types';

// Re-export types for backward compatibility
export type { Notification, NotificationType } from '../types';

export interface CreateNotificationRequest {
  type: NotificationType;
  title: string;
  message: string;
  userId?: string; // Optional, defaults to current user
}

// Re-export ApiError for backward compatibility
export type { ApiError } from './errors';

/**
 * Get all notifications for current user
 */
export async function getNotifications(): Promise<Notification[]> {
  const response = await apiClient.get<{ notifications: Notification[] } | Notification[]>(
    '/api/notifications',
  );
  // Handle both response formats for backward compatibility
  if (Array.isArray(response)) {
    return response;
  }
  return response.notifications || [];
}

/**
 * Get unread count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await apiClient.get<{ count: number }>(
    '/api/notifications/unread-count',
  );
  return response.count || 0;
}

/**
 * Create a new notification
 */
export async function createNotification(
  data: CreateNotificationRequest,
): Promise<Notification> {
  const response = await apiClient.post<{ notification: Notification }>(
    '/api/notifications',
    data as unknown as Record<string, unknown>,
  );
  return response.notification;
}

/**
 * Mark notification as read
 */
export async function markAsRead(id: string): Promise<void> {
  await apiClient.patch(`/api/notifications/${id}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  await apiClient.patch('/api/notifications/read-all');
}
