import React, { useRef, useEffect } from 'react';
import { useNotification } from '../contexts/NotificationContext';
import { Notification } from '../lib/types';

const timeSince = (date: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (seconds < 60) return "just now";
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
};

const icons = {
    success: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    info: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
    warning: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>,
    error: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

const colors = {
    success: 'text-green-400',
    info: 'text-blue-400',
    warning: 'text-yellow-400',
    error: 'text-red-400',
};

const NotificationItem: React.FC<{ notification: Notification; onClick: () => void }> = ({ notification, onClick }) => (
    <button onClick={onClick} className="w-full text-left p-3 hover:bg-border/50 rounded-lg flex items-start space-x-3">
        <div className={`mt-1 flex-shrink-0 ${colors[notification.type]}`}>{icons[notification.type]}</div>
        <div className="flex-1">
            <p className="text-sm font-semibold text-text-primary">{notification.title}</p>
            <p className="text-sm text-text-secondary">{notification.message}</p>
            <p className="text-xs text-text-muted mt-1">{timeSince(notification.timestamp)}</p>
        </div>
        {!notification.read && <div className="mt-1 w-2.5 h-2.5 bg-accent rounded-full flex-shrink-0"></div>}
    </button>
);


const NotificationCenter: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const { notifications, markAsRead, markAllAsRead, unreadCount, isLoading, error, clearError, refreshNotifications } = useNotification();
    const centerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (centerRef.current && !centerRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div ref={centerRef} className="absolute top-full right-0 mt-2 w-80 md:w-96 bg-secondary rounded-lg shadow-2xl border border-border z-50 flex flex-col max-h-[80vh]">
            <div className="p-3 flex justify-between items-center border-b border-border">
                <h3 className="font-bold text-text-primary">Notifications</h3>
                <div className="flex items-center gap-2">
                    {unreadCount > 0 && <button onClick={markAllAsRead} className="text-xs font-semibold text-accent hover:underline">Mark all as read</button>}
                    <button onClick={refreshNotifications} className="text-xs text-text-muted hover:text-text-primary" aria-label="Refresh notifications">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                    </button>
                </div>
            </div>
            {error && (
                <div className="p-3 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between">
                    <p className="text-sm text-red-400">{error}</p>
                    <button onClick={clearError} className="text-red-400 hover:text-red-300">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-2 no-scrollbar">
                {isLoading ? (
                    <div className="text-center py-16">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
                        <p className="mt-4 text-sm text-text-muted">Loading notifications...</p>
                    </div>
                ) : notifications.length > 0 ? (
                    <div className="space-y-1">
                        {notifications.map(n => <NotificationItem key={n.id} notification={n} onClick={() => markAsRead(n.id)} />)}
                    </div>
                ) : (
                    <div className="text-center py-16 text-text-muted">
                        <p>No notifications yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationCenter;