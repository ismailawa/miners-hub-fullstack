import apiClient from './client';

export type MineralPriceOverrideStatus = 'draft' | 'published';

export interface MineralPriceOverride {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  source: string;
  displayOrder: number;
  status: MineralPriceOverrideStatus;
  lastReportedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MineralPriceOverridePayload {
  name: string;
  symbol: string;
  price: number;
  change?: number;
  source?: string;
  displayOrder?: number;
  status?: MineralPriceOverrideStatus;
}

export async function getPublishedMineralPriceOverrides() {
  return apiClient.get<MineralPriceOverride[]>('/api/mineral-prices', {
    skipAuth: true,
  });
}

export async function getAdminMineralPriceOverrides() {
  return apiClient.get<MineralPriceOverride[]>('/api/mineral-prices/admin');
}

export async function createMineralPriceOverride(
  payload: MineralPriceOverridePayload,
) {
  return apiClient.post<MineralPriceOverride>('/api/mineral-prices', payload);
}

export async function updateMineralPriceOverride(
  id: string,
  payload: Partial<MineralPriceOverridePayload>,
) {
  return apiClient.patch<MineralPriceOverride>(`/api/mineral-prices/${id}`, payload);
}

export async function deleteMineralPriceOverride(id: string) {
  return apiClient.delete<{ success: boolean }>(`/api/mineral-prices/${id}`);
}
