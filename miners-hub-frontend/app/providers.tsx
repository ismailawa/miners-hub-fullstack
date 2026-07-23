'use client';

import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import { OfflineQueueProvider } from '../components/offline/OfflineQueueProvider';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <AuthProvider>
            <NotificationProvider>
                <OfflineQueueProvider>{children}</OfflineQueueProvider>
            </NotificationProvider>
        </AuthProvider>
    );
}
