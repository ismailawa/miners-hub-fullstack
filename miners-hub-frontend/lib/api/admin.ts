import apiClient from './client';
import type { Event } from '../types';
import type { EventPayload } from './events';
import type { BackendOrder } from './orders';

export interface AdminUser {
  id: string;
  name?: string;
  email: string;
  role: string;
  verificationStatus: string;
  onboardingComplete: boolean;
  createdAt: string;
  miner?: any;
  investor?: any;
}

export interface AdminListing {
  id: string;
  mineralType: string;
  quantity: number;
  price: number;
  status: string;
  createdAt: string;
  miner?: {
    companyName: string;
    user?: {
      name: string;
      email: string;
    }
  }
}

export interface AdminDocument {
  id: string;
  userId: string;
  listingId?: string | null;
  type: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  reviewStatus: 'pending' | 'approved' | 'rejected';
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    role?: string;
  };
  listing?: {
    id: string;
    mineralType?: string;
  } | null;
}

export async function getUsers(status?: string): Promise<AdminUser[]> {
  const url = status ? `/api/admin/users?status=${status}` : '/api/admin/users';
  return apiClient.get<AdminUser[]>(url);
}

export async function verifyUser(id: string, status: string): Promise<AdminUser> {
  return apiClient.patch<AdminUser>(`/api/admin/users/${id}/verify`, { status });
}

export async function getListings(status?: string): Promise<AdminListing[]> {
  const url = status ? `/api/admin/listings?status=${status}` : '/api/admin/listings';
  return apiClient.get<AdminListing[]>(url);
}

export async function updateListingStatus(id: string, status: string): Promise<AdminListing> {
  return apiClient.patch<AdminListing>(`/api/admin/listings/${id}/status`, { status });
}

export async function getAdminOrders(status?: string): Promise<BackendOrder[]> {
  const url = status ? `/api/admin/orders?status=${status}` : '/api/admin/orders';
  return apiClient.get<BackendOrder[]>(url);
}

export async function getAdminOrder(id: string): Promise<BackendOrder> {
  return apiClient.get<BackendOrder>(`/api/admin/orders/${id}`);
}

export async function releaseEscrow(orderId: string) {
  return apiClient.post(`/api/admin/orders/${orderId}/escrow/release`, {});
}

export async function refundEscrow(orderId: string) {
  return apiClient.post(`/api/admin/orders/${orderId}/escrow/refund`, {});
}

export async function getAdminDocuments(status?: string, type?: string): Promise<AdminDocument[]> {
  const params = new URLSearchParams();
  if (status && status !== 'all') params.set('status', status);
  if (type && type !== 'all') params.set('type', type);
  const query = params.toString();
  return apiClient.get<AdminDocument[]>(`/api/admin/documents${query ? `?${query}` : ''}`);
}

export async function reviewDocument(
  id: string,
  status: AdminDocument['reviewStatus'],
  notes?: string,
): Promise<AdminDocument> {
  return apiClient.patch<AdminDocument>(`/api/admin/documents/${id}/review`, { status, notes });
}

export async function getEvents(): Promise<Event[]> {
  return apiClient.get<Event[]>('/api/admin/events');
}

export async function createEvent(payload: EventPayload): Promise<Event> {
  return apiClient.post<Event>('/api/admin/events', payload);
}

export async function updateEvent(id: string, payload: Partial<EventPayload>): Promise<Event> {
  return apiClient.patch<Event>(`/api/admin/events/${id}`, payload);
}

export async function deleteEvent(id: string): Promise<{ success: boolean }> {
  return apiClient.delete<{ success: boolean }>(`/api/admin/events/${id}`);
}
