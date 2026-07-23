import apiClient from './client';

export type MineSiteStatus = 'planned' | 'active' | 'suspended' | 'closed';
export type MineSiteRiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface MineSite {
  id: string;
  name: string;
  operatorId: string;
  operator?: {
    id: string;
    companyName: string;
    location?: string | null;
    user?: {
      id: string;
      name?: string | null;
      email: string;
      verificationStatus: string;
    } | null;
  } | null;
  licenseId?: string | null;
  mineralTypes: string[];
  state: string;
  lga?: string | null;
  community?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  boundaryPolygon?: Record<string, any> | null;
  siteStatus: MineSiteStatus;
  riskLevel: MineSiteRiskLevel;
  documentIds: string[];
  productionReportIds: string[];
  complianceCaseIds: string[];
  environmentalRecordIds: string[];
  metadata?: Record<string, any> | null;
  links: {
    hasLicense: boolean;
    documentCount: number;
    productionReportCount: number;
    complianceCaseCount: number;
    environmentalRecordCount: number;
  };
  postgis: {
    enabled: boolean;
    recommendation: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MineSitePayload {
  name: string;
  operatorId?: string;
  licenseId?: string | null;
  mineralTypes: string[];
  state: string;
  lga?: string | null;
  community?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  siteStatus?: MineSiteStatus;
  riskLevel?: MineSiteRiskLevel;
  documentIds?: string[];
  productionReportIds?: string[];
  complianceCaseIds?: string[];
  environmentalRecordIds?: string[];
}

export interface MineSiteFilters {
  search?: string;
  state?: string;
  mineralType?: string;
  siteStatus?: string;
  riskLevel?: string;
}

interface PaginatedMineSites {
  data: MineSite[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getMineSites(filters: MineSiteFilters = {}) {
  const params = new URLSearchParams();
  params.set('limit', '100');
  if (filters.search) params.set('search', filters.search);
  if (filters.state) params.set('state', filters.state);
  if (filters.mineralType) params.set('mineralType', filters.mineralType);
  if (filters.siteStatus && filters.siteStatus !== 'all') params.set('siteStatus', filters.siteStatus);
  if (filters.riskLevel && filters.riskLevel !== 'all') params.set('riskLevel', filters.riskLevel);

  return apiClient.get<PaginatedMineSites>(`/api/mine-sites?${params.toString()}`);
}

export async function getMineSite(id: string) {
  return apiClient.get<MineSite>(`/api/mine-sites/${id}`);
}

export async function createMineSite(payload: MineSitePayload) {
  return apiClient.post<MineSite>('/api/mine-sites', payload);
}

export async function updateMineSite(id: string, payload: Partial<MineSitePayload>) {
  return apiClient.patch<MineSite>(`/api/mine-sites/${id}`, payload);
}

export async function deleteMineSite(id: string) {
  return apiClient.delete<{ success: boolean }>(`/api/mine-sites/${id}`);
}
