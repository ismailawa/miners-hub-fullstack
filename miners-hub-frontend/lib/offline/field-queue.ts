import apiClient from '../api/client';

export type FieldQueueKind = 'production_report' | 'environmental_record' | 'mine_site';

export interface FieldQueueItem {
  id: string;
  kind: FieldQueueKind;
  endpoint: string;
  method: 'POST' | 'PATCH';
  payload: unknown;
  createdAt: string;
  lastError?: string;
}

const STORAGE_KEY = 'minersHub.fieldQueue.v1';

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function getFieldQueue(): FieldQueueItem[] {
  if (!canUseStorage()) return [];
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveFieldQueue(items: FieldQueueItem[]) {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent('miners-hub-field-queue-change'));
}

export function queueFieldSubmission(item: Omit<FieldQueueItem, 'id' | 'createdAt'>) {
  const queued: FieldQueueItem = {
    ...item,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  saveFieldQueue([...getFieldQueue(), queued]);
  return queued;
}

export async function flushFieldQueue() {
  const queue = getFieldQueue();
  const remaining: FieldQueueItem[] = [];
  let sent = 0;

  for (const item of queue) {
    try {
      await apiClient.request(item.endpoint, {
        method: item.method,
        body: JSON.stringify(item.payload),
      });
      sent += 1;
    } catch (error: any) {
      remaining.push({
        ...item,
        lastError: error?.message || 'Sync failed',
      });
    }
  }

  saveFieldQueue(remaining);
  return { sent, remaining: remaining.length };
}

export function clearFieldQueueItem(id: string) {
  saveFieldQueue(getFieldQueue().filter((item) => item.id !== id));
}
