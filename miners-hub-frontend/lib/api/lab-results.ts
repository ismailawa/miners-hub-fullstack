import apiClient from './client';

export type LaboratoryPartnerStatus = 'pending' | 'active' | 'suspended';
export type LabResultStatus = 'requested' | 'submitted' | 'verified' | 'rejected';

export interface LaboratoryPartner {
  id: string;
  userId?: string | null;
  companyName: string;
  accreditationNumber?: string | null;
  address?: string | null;
  status: LaboratoryPartnerStatus;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LabResult {
  id: string;
  labId: string;
  requesterId: string;
  listingId?: string | null;
  productionReportId?: string | null;
  mineralPassportId?: string | null;
  sampleReference: string;
  mineralType: string;
  grade?: string | null;
  assayValue?: number | null;
  assayUnit?: string | null;
  resultPayload: Record<string, any>;
  certificateUrl?: string | null;
  status: LabResultStatus;
  reviewNotes?: string | null;
  verifiedBy?: string | null;
  verifiedAt?: string | null;
  lab?: LaboratoryPartner;
  listing?: { id: string; mineralType: string; gradePurity?: string | null };
  productionReport?: { id: string; mineralType: string; grade?: string | null };
  createdAt: string;
  updatedAt: string;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface LabResultPayload {
  labId: string;
  listingId?: string | null;
  productionReportId?: string | null;
  mineralPassportId?: string | null;
  sampleReference: string;
  mineralType: string;
  grade?: string | null;
  assayValue?: number | null;
  assayUnit?: string | null;
  resultPayload?: Record<string, any>;
  certificateUrl?: string | null;
}

export interface LaboratoryPartnerPayload {
  userId?: string | null;
  companyName: string;
  accreditationNumber?: string | null;
  address?: string | null;
  status?: LaboratoryPartnerStatus;
  contactEmail?: string | null;
  contactPhone?: string | null;
}

export async function getLaboratoryPartners() {
  return apiClient.get<LaboratoryPartner[]>('/api/lab-results/partners');
}

export async function createLaboratoryPartner(payload: LaboratoryPartnerPayload) {
  return apiClient.post<LaboratoryPartner>('/api/lab-results/partners', payload);
}

export async function updateLaboratoryPartner(id: string, payload: Partial<LaboratoryPartnerPayload>) {
  return apiClient.patch<LaboratoryPartner>(`/api/lab-results/partners/${id}`, payload);
}

export async function getLabResults(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return apiClient.get<Paginated<LabResult>>(`/api/lab-results?${params.toString()}`);
}

export async function createLabResult(payload: LabResultPayload) {
  return apiClient.post<LabResult>('/api/lab-results', payload);
}

export async function updateLabResult(id: string, payload: Partial<LabResultPayload>) {
  return apiClient.patch<LabResult>(`/api/lab-results/${id}`, payload);
}

export async function verifyLabResult(id: string, payload: {
  status: Extract<LabResultStatus, 'verified' | 'rejected'>;
  reviewNotes?: string | null;
}) {
  return apiClient.patch<LabResult>(`/api/lab-results/${id}/verify`, payload);
}
