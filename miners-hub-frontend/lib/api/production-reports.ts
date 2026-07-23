import apiClient from './client';

export type ProductionReportStatus = 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'overdue';

export interface ProductionReport {
  id: string;
  siteId: string;
  minerId: string;
  mineralType: string;
  periodStart: string;
  periodEnd: string;
  quantity: number;
  unit: string;
  grade?: string | null;
  destination?: string | null;
  estimatedValue?: number | null;
  royaltyRate: number;
  royaltyDue?: number | null;
  supportingDocumentIds: string[];
  status: ProductionReportStatus;
  submittedAt?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  reviewNotes?: string | null;
  site?: { id: string; name: string; state: string; lga?: string | null; operatorId: string } | null;
  miner?: { id: string; companyName: string; user?: { id: string; name?: string | null; email: string } | null } | null;
  reviewer?: { id: string; name?: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductionReportPayload {
  siteId: string;
  minerId?: string;
  mineralType: string;
  periodStart: string;
  periodEnd: string;
  quantity: number;
  unit: string;
  grade?: string | null;
  destination?: string | null;
  estimatedValue?: number | null;
  royaltyRate?: number;
  supportingDocumentIds?: string[];
  status?: ProductionReportStatus;
}

export interface ProductionAnalytics {
  totalReports: number;
  approvedReports: number;
  pendingReview: number;
  totalQuantity: number;
  estimatedValue: number;
  royaltyDue: number;
  byMineral: Record<string, { quantity: number; value: number; royalty: number }>;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getProductionReports(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return apiClient.get<Paginated<ProductionReport>>(`/api/production-reports?${params.toString()}`);
}

export async function createProductionReport(payload: ProductionReportPayload) {
  return apiClient.post<ProductionReport>('/api/production-reports', payload);
}

export async function updateProductionReport(id: string, payload: Partial<ProductionReportPayload>) {
  return apiClient.patch<ProductionReport>(`/api/production-reports/${id}`, payload);
}

export async function reviewProductionReport(id: string, status: ProductionReportStatus, reviewNotes?: string) {
  return apiClient.patch<ProductionReport>(`/api/production-reports/${id}/review`, { status, reviewNotes });
}

export async function getProductionAnalytics() {
  return apiClient.get<ProductionAnalytics>('/api/analytics/production');
}
