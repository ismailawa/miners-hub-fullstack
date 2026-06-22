'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
  useEffect,
} from 'react';
import { Notification } from '../lib/types';
import NotificationToast from '../components/NotificationToast';
import * as notificationsApi from '../lib/api/notifications';
import { useAuth } from './AuthContext';

interface NotificationContextType {
  notifications: Notification[];
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'userId' | 'createdAt'> & {
      userId?: string;
      createdAt?: string;
    }
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
  refreshNotifications: () => Promise<void>;
}

const NotificationContext = createContext<
  NotificationContextType | undefined
>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [toasts, setToasts] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUser } = useAuth();

  // Fetch notifications from API
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) {
      // Clear notifications if user is not authenticated
      setNotifications([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const fetchedNotifications = await notificationsApi.getNotifications();
      setNotifications(fetchedNotifications);
    } catch (err) {
      const apiError = err as notificationsApi.ApiError;
      setError(
        apiError.message || 'Failed to fetch notifications. Please try again.',
      );
      console.error('Failed to fetch notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentUser]);

  // Fetch notifications on mount and when user changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addNotification = useCallback(
    async (
      notificationData: Omit<Notification, 'id' | 'timestamp' | 'read' | 'userId' | 'createdAt'> & {
        userId?: string;
        createdAt?: string;
      },
    ) => {
      const now = new Date().toISOString();
      const userId = notificationData.userId || currentUser?.id || '';
      const createdAt = notificationData.createdAt || now;

      // If user is authenticated, create notification via API
      if (currentUser) {
        try {
          const newNotification = await notificationsApi.createNotification({
            type: notificationData.type,
            title: notificationData.title,
            message: notificationData.message,
          });

          // Add to local state and show toast
          setNotifications((prev) => [newNotification, ...prev]);
          setToasts((prev) => [newNotification, ...prev]);
        } catch (err) {
          const apiError = err as notificationsApi.ApiError;
          setError(
            apiError.message || 'Failed to create notification. Please try again.',
          );
          console.error('Failed to create notification:', err);

          // Fallback: create local notification for toast display
          const fallbackNotification: Notification = {
            ...notificationData,
            userId,
            createdAt,
            id: `notif-${Date.now()}`,
            timestamp: now,
            read: false,
          };
          setToasts((prev) => [fallbackNotification, ...prev]);
        }
      } else {
        // If not authenticated, just show toast (no persistence)
        const localNotification: Notification = {
          ...notificationData,
          userId,
          createdAt,
          id: `notif-${Date.now()}`,
          timestamp: now,
          read: false,
        };
        setToasts((prev) => [localNotification, ...prev]);
      }
    },
    [currentUser],
  );

  const markAsRead = useCallback(
    async (id: string) => {
      // Optimistic update
      const updatedNotifications = notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n,
      );
      setNotifications(updatedNotifications);

      // If user is authenticated, update via API
      if (currentUser) {
        try {
          await notificationsApi.markAsRead(id);
        } catch (err) {
          // Revert on error
          setNotifications(notifications);
          const apiError = err as notificationsApi.ApiError;
          setError(
            apiError.message || 'Failed to mark notification as read. Please try again.',
          );
          console.error('Failed to mark notification as read:', err);
        }
      }
    },
    [notifications, currentUser],
  );

  const markAllAsRead = useCallback(async () => {
    // Optimistic update
    const updatedNotifications = notifications.map((n) => ({
      ...n,
      read: true,
    }));
    setNotifications(updatedNotifications);

    // If user is authenticated, update via API
    if (currentUser) {
      try {
        await notificationsApi.markAllAsRead();
      } catch (err) {
        // Revert on error
        setNotifications(notifications);
        const apiError = err as notificationsApi.ApiError;
        setError(
          apiError.message || 'Failed to mark all notifications as read. Please try again.',
        );
        console.error('Failed to mark all notifications as read:', err);
      }
    }
  }, [notifications, currentUser]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const refreshNotifications = useCallback(async () => {
    await fetchNotifications();
  }, [fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        markAsRead,
        markAllAsRead,
        unreadCount,
        isLoading,
        error,
        clearError,
        refreshNotifications,
      }}
    >
      {children}
      <div className="fixed top-20 right-4 z-[9999] flex flex-col items-end gap-2">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            notification={toast}
            onDismiss={removeToast}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      'useNotification must be used within a NotificationProvider',
    );
  }
  return context;
};
