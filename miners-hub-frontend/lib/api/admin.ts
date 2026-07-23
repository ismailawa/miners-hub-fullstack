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
  phoneNumber?: string | null;
  profileImageUrl?: string | null;
  kycSubmittedAt?: string | null;
  kycVerifiedAt?: string | null;
  kycRejectedAt?: string | null;
  createdAt: string;
  miner?: {
    id?: string;
    companyName?: string | null;
    location?: string | null;
    businessAddress?: string | null;
    businessWebsite?: string | null;
    industry?: string | null;
    yearsInOperation?: string | null;
    listings?: Array<{
      id: string;
      mineralType: string;
      status: string;
      quantity: number;
      price: number;
      createdAt: string;
    }>;
  } | null;
  investor?: {
    id?: string;
    investmentPreferences?: string[] | null;
    riskAppetite?: string | null;
  } | null;
  documents?: Array<{
    id: string;
    type: string;
    fileName: string;
    reviewStatus: 'pending' | 'approved' | 'rejected';
    createdAt: string;
  }>;
}

export interface AdminListing {
  id: string;
  mineralType: string;
  quantity: number;
  price: number;
  gradePurity?: string | null;
  location?: string | null;
  listingType?: 'buy_now' | 'auction';
  moisturePercentage?: number | null;
  images?: string[];
  status: string;
  createdAt: string;
  updatedAt?: string;
  miner?: {
    id?: string;
    companyName: string;
    user?: {
      name: string;
      email: string;
      verificationStatus?: string;
    }
  }
}

export interface AdminListingsResponse {
  data: AdminListing[];
  total: number;
  limit: number;
  rawOffset: number;
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

export interface AdminMinerRegistryItem {
  id: string;
  registryType?: 'miner' | 'investor' | 'laboratory' | 'logistics';
  registryLabel?: string;
  detailAvailable?: boolean;
  status?: 'pending' | 'verified' | 'rejected' | 'active' | 'suspended';
  primaryFocus?: string[];
  contact?: {
    name?: string | null;
    email?: string | null;
    phoneNumber?: string | null;
  };
  userId: string | null;
  companyName: string;
  location: string;
  miningLicence?: string | null;
  companyRegNumber?: string | null;
  businessAddress?: string | null;
  businessWebsite?: string | null;
  industry?: string | null;
  yearsInOperation?: string | null;
  cooperativeName?: string | null;
  cooperativeRegNumber?: string | null;
  partnerType?: string | null;
  partnerOrganization?: string | null;
  miningEquipment: string[];
  certifications: string[];
  user: {
    id: string;
    name?: string | null;
    email: string;
    phoneNumber?: string | null;
    verificationStatus: 'pending' | 'verified' | 'rejected';
    onboardingComplete: boolean;
    kycSubmittedAt?: string | null;
    kycVerifiedAt?: string | null;
    kycRejectedAt?: string | null;
    metamapVerificationId?: string | null;
    createdAt: string;
  } | null;
  documentSummary: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  listingSummary: {
    total: number;
    published: number;
    submitted: number;
    minerals: string[];
  };
  licenseStatus: 'pending' | 'approved' | 'rejected' | 'missing' | 'active' | 'suspended';
  latestDocumentAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMinerRegistryDetail extends AdminMinerRegistryItem {
  verification: {
    status: 'pending' | 'verified' | 'rejected';
    onboardingComplete: boolean;
    kycSubmittedAt?: string | null;
    kycVerifiedAt?: string | null;
    kycRejectedAt?: string | null;
    metamapVerificationId?: string | null;
    licenseStatus: 'pending' | 'approved' | 'rejected' | 'missing' | 'active' | 'suspended';
  };
  documents: Array<{
    id: string;
    type: string;
    fileName: string;
    reviewStatus: 'pending' | 'approved' | 'rejected';
    reviewNotes?: string | null;
    reviewedAt?: string | null;
    createdAt: string;
  }>;
  listings: Array<{
    id: string;
    mineralType: string;
    status: string;
    quantity: number;
    price: number;
    createdAt: string;
  }>;
  timeline: Array<{
    id: string;
    title: string;
    status: string;
    occurredAt: string;
    description?: string | null;
  }>;
}

export interface MinerRegistryFilters {
  role?: string;
  status?: string;
  documentStatus?: string;
  location?: string;
  mineralType?: string;
}

export async function getUsers(status?: string): Promise<AdminUser[]> {
  const url = status ? `/api/admin/users?status=${status}` : '/api/admin/users';
  return apiClient.get<AdminUser[]>(url);
}

export async function getMinerRegistry(filters: MinerRegistryFilters = {}): Promise<AdminMinerRegistryItem[]> {
  const params = new URLSearchParams();
  if (filters.role && filters.role !== 'all') params.set('role', filters.role);
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.documentStatus && filters.documentStatus !== 'all') params.set('documentStatus', filters.documentStatus);
  if (filters.location) params.set('location', filters.location);
  if (filters.mineralType) params.set('mineralType', filters.mineralType);
  const query = params.toString();
  return apiClient.get<AdminMinerRegistryItem[]>(`/api/admin/miner-registry${query ? `?${query}` : ''}`);
}

export async function getMinerRegistryDetail(id: string): Promise<AdminMinerRegistryDetail> {
  return apiClient.get<AdminMinerRegistryDetail>(`/api/admin/miner-registry/${id}`);
}

export async function verifyUser(id: string, status: string): Promise<AdminUser> {
  return apiClient.patch<AdminUser>(`/api/admin/users/${id}/verify`, { status });
}

export async function getListings(filters: {
  status?: string;
  listingType?: string;
  limit?: number;
  rawOffset?: number;
} = {}): Promise<AdminListingsResponse> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== 'all') params.set('status', filters.status);
  if (filters.listingType && filters.listingType !== 'all') params.set('listingType', filters.listingType);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.rawOffset !== undefined) params.set('rawOffset', String(filters.rawOffset));
  const query = params.toString();
  const response = await apiClient.get<AdminListing[] | AdminListingsResponse>(
    `/api/admin/listings${query ? `?${query}` : ''}`,
  );
  if (Array.isArray(response)) {
    return {
      data: response,
      total: response.length,
      limit: filters.limit || response.length,
      rawOffset: filters.rawOffset || 0,
    };
  }
  return response;
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
