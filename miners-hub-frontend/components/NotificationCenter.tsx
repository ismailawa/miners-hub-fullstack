"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Check, CheckCheck } from "lucide-react";
import { useNotifications } from "@/lib/contexts/NotificationContext";
import { useAuth } from "@/lib/contexts/AuthContext";
import { formatDistanceToNow } from "date-fns";

export function NotificationCenter() {
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);

  // Don't show notification center if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  const unreadNotifications = notifications.filter((n) => !n.read);
  const readNotifications = notifications.filter((n) => n.read);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5 text-text" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 !bg-primary-light !border-border max-h-[500px] overflow-y-auto"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-semibold text-text">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs !text-accent hover:!text-accent hover:!bg-transparent"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="p-4 text-center text-text/60 text-sm">
            Loading notifications...
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-4 text-center text-text/60 text-sm">
            No notifications
          </div>
        ) : (
          <>
            {/* Unread notifications */}
            {unreadNotifications.length > 0 && (
              <div className="py-2">
                {unreadNotifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="!bg-transparent hover:!bg-primary/50 !p-3 !cursor-pointer"
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div
                        className={`mt-1 h-2 w-2 rounded-full ${
                          notification.notificationType === "error"
                            ? "bg-red-500"
                            : notification.notificationType === "warning"
                            ? "bg-yellow-500"
                            : notification.notificationType === "success"
                            ? "bg-green-500"
                            : "bg-blue-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text text-sm">
                          {notification.title}
                        </p>
                        <p className="text-text/70 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-text/50 text-xs mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 !text-text/50 hover:!text-accent"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsRead(notification.id);
                        }}
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}

            {/* Separator if both unread and read */}
            {unreadNotifications.length > 0 && readNotifications.length > 0 && (
              <DropdownMenuSeparator className="!bg-border" />
            )}

            {/* Read notifications */}
            {readNotifications.length > 0 && (
              <div className="py-2">
                {readNotifications.slice(0, 5).map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="!bg-transparent hover:!bg-primary/30 !p-3 !cursor-pointer opacity-70"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className="mt-1 h-2 w-2 rounded-full bg-text/30" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-text/70 text-sm">
                          {notification.title}
                        </p>
                        <p className="text-text/50 text-xs mt-1">
                          {notification.message}
                        </p>
                        <p className="text-text/40 text-xs mt-1">
                          {formatDistanceToNow(new Date(notification.createdAt), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

