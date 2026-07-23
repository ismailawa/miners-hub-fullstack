'use client';

import React, { useEffect } from 'react';
import { flushFieldQueue } from '../../lib/offline/field-queue';

export function OfflineQueueProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => undefined);
    }

    const flush = () => {
      void flushFieldQueue();
    };

    if (navigator.onLine) flush();
    window.addEventListener('online', flush);
    return () => window.removeEventListener('online', flush);
  }, []);

  return <>{children}</>;
}
