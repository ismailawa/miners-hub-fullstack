import apiClient from './client';

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
