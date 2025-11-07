"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import {
  Notification,
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification as apiCreateNotification,
} from "@/lib/api/notifications";
import { NotificationType } from "@/lib/types";
import { toast } from "sonner";

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  fetchNotifications: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  createNotification: (notification: Omit<Notification, "id" | "userId" | "createdAt" | "read" | "readAt">) => Promise<void>;
  clearError: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const [notificationsData, count] = await Promise.all([
        getNotifications(),
        getUnreadCount(),
      ]);
      setNotifications(notificationsData);
      setUnreadCount(count);
    } catch (error) {
      const apiError = error as { message: string; status: number };
      setError(apiError.message || "Failed to fetch notifications");
      console.error("Failed to fetch notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  // Mark notification as read
  const handleMarkAsRead = useCallback(async (id: string) => {
    try {
      const updated = await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? updated : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      const apiError = error as { message: string; status: number };
      toast.error(apiError.message || "Failed to mark notification as read");
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  // Mark all as read
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      await markAllAsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
      toast.success("All notifications marked as read");
    } catch (error) {
      const apiError = error as { message: string; status: number };
      toast.error(apiError.message || "Failed to mark all as read");
      console.error("Failed to mark all as read:", error);
    }
  }, []);

  // Create notification (and show toast)
  const handleCreateNotification = useCallback(
    async (notification: Omit<Notification, "id" | "userId" | "createdAt" | "read" | "readAt">) => {
      try {
        const newNotification = await apiCreateNotification({
          userId: "", // Backend will extract userId from auth token
          title: notification.title,
          message: notification.message,
          notificationType: notification.notificationType || NotificationType.INFO,
          metadata: notification.metadata ?? undefined,
        });
        setNotifications((prev) => [newNotification, ...prev]);
        setUnreadCount((prev) => prev + 1);

        // Show toast based on notification type
        const notificationType = notification.notificationType || NotificationType.INFO;
        switch (notificationType) {
          case NotificationType.SUCCESS:
            toast.success(notification.title, { description: notification.message });
            break;
          case NotificationType.ERROR:
            toast.error(notification.title, { description: notification.message });
            break;
          case NotificationType.WARNING:
            toast.warning(notification.title, { description: notification.message });
            break;
          default:
            toast.info(notification.title, { description: notification.message });
        }
      } catch (error) {
        const apiError = error as { message: string; status: number };
        toast.error(apiError.message || "Failed to create notification");
        console.error("Failed to create notification:", error);
      }
    },
    []
  );

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Fetch notifications on mount and when auth state changes
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const value: NotificationContextType = {
    notifications,
    unreadCount,
    isLoading,
    error,
    fetchNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
    createNotification: handleCreateNotification,
    clearError,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}

