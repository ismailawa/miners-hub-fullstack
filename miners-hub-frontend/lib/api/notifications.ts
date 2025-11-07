/**
 * Notifications API Service
 * Handles all notification-related API calls
 */

import { get, post, patch } from "./client";
import type { Notification, NotificationType } from "@/lib/types";

// Re-export for backward compatibility
export type { Notification, NotificationType } from "@/lib/types";

export interface CreateNotificationRequest {
  userId: string;
  title: string;
  message: string;
  notificationType?: NotificationType;
  metadata?: Record<string, any> | null;
}

export interface UnreadCountResponse {
  count: number;
}

/**
 * Get all notifications for current user
 */
export async function getNotifications(): Promise<Notification[]> {
  return get<Notification[]>("/notifications");
}

/**
 * Get unread notifications count
 */
export async function getUnreadCount(): Promise<number> {
  const response = await get<UnreadCountResponse>("/notifications/unread-count");
  return response.count;
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string): Promise<Notification> {
  return patch<Notification>(`/notifications/${notificationId}/read`);
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  return patch<void>("/notifications/read-all");
}

/**
 * Create a new notification
 */
export async function createNotification(
  data: CreateNotificationRequest
): Promise<Notification> {
  return post<Notification>("/notifications", data);
}
