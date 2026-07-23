import apiClient from './client';

export type TrustedPartnerStatus = 'draft' | 'published';

export interface TrustedPartner {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  category?: string | null;
  displayOrder: number;
  status: TrustedPartnerStatus;
  createdAt: string;
  updatedAt: string;
}

export interface TrustedPartnerPayload {
  name: string;
  logoUrl: string;
  websiteUrl?: string | null;
  category?: string | null;
  displayOrder?: number;
  status?: TrustedPartnerStatus;
}

export async function getPublishedTrustedPartners() {
  return apiClient.get<TrustedPartner[]>('/api/trusted-partners', {
    skipAuth: true,
  });
}

export async function getAdminTrustedPartners() {
  return apiClient.get<TrustedPartner[]>('/api/trusted-partners/admin');
}

export async function createTrustedPartner(payload: TrustedPartnerPayload) {
  return apiClient.post<TrustedPartner>('/api/trusted-partners', payload);
}

export async function updateTrustedPartner(
  id: string,
  payload: Partial<TrustedPartnerPayload>,
) {
  return apiClient.patch<TrustedPartner>(`/api/trusted-partners/${id}`, payload);
}

export async function deleteTrustedPartner(id: string) {
  return apiClient.delete<{ success: boolean }>(`/api/trusted-partners/${id}`);
}
