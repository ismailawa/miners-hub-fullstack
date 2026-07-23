import apiClient from './client';

export type MineralPassportStatus = 'active' | 'revoked' | 'disputed' | 'expired';

export interface MineralPassport {
  id: string;
  passportNumber: string;
  publicVerificationToken: string;
  minerId: string;
  siteId?: string | null;
  licenseId?: string | null;
  productionReportId?: string | null;
  labResultId?: string | null;
  listingId?: string | null;
  orderId?: string | null;
  shipmentId?: string | null;
  contractId?: string | null;
  escrowTransactionId?: string | null;
  status: MineralPassportStatus;
  qrCodeUrl?: string | null;
  snapshot: Record<string, any>;
  issuedBy?: string | null;
  issuedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  miner?: { id: string; companyName?: string; businessAddress?: string | null };
  labResult?: { id: string; sampleReference: string; mineralType: string; grade?: string | null; certificateUrl?: string | null; status: string };
  listing?: { id: string; mineralType: string; quantity: number; gradePurity?: string | null };
  order?: { id: string; status: string; paymentStatus?: string };
  shipment?: { id: string; trackingId: string; status: string; currentMilestone?: string | null };
}

export interface PublicMineralPassport {
  id: string;
  passportNumber: string;
  status: MineralPassportStatus;
  issuedAt?: string | null;
  qrCodeUrl?: string | null;
  snapshot: Record<string, any>;
  miner?: Record<string, any> | null;
  site?: Record<string, any> | null;
  license?: Record<string, any> | null;
  labResult?: Record<string, any> | null;
  listing?: Record<string, any> | null;
  shipment?: Record<string, any> | null;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface MineralPassportPayload {
  minerId?: string;
  siteId?: string | null;
  licenseId?: string | null;
  productionReportId?: string | null;
  labResultId?: string | null;
  listingId?: string | null;
  orderId?: string | null;
  shipmentId?: string | null;
  contractId?: string | null;
  escrowTransactionId?: string | null;
  snapshot?: Record<string, any>;
}

export async function getMineralPassports(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return apiClient.get<Paginated<MineralPassport>>(`/api/mineral-passports?${params.toString()}`);
}

export async function createMineralPassport(payload: MineralPassportPayload) {
  return apiClient.post<MineralPassport>('/api/mineral-passports', payload);
}

export async function updateMineralPassportStatus(id: string, payload: {
  status: MineralPassportStatus;
  reason?: string | null;
}) {
  return apiClient.patch<MineralPassport>(`/api/mineral-passports/${id}/status`, payload);
}

export async function getPublicMineralPassport(token: string) {
  return apiClient.get<PublicMineralPassport>(`/api/public/mineral-passports/${token}`, { skipAuth: true });
}
