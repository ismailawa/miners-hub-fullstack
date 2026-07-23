import apiClient from './client';

export type InvestorOpportunityStatus = 'draft' | 'published' | 'closed' | 'archived';
export type InvestorOpportunityStage = 'exploration' | 'development' | 'production' | 'expansion';
export type InvestorOpportunityRiskRating = 'low' | 'medium' | 'high' | 'critical';
export type InvestorOpportunityInquiryStatus = 'new' | 'contacted' | 'due_diligence' | 'closed';

export interface InvestorOpportunity {
  id: string;
  siteId?: string | null;
  sponsorId: string;
  title: string;
  mineralFocus: string[];
  capitalRequired?: number | null;
  investmentType: string;
  stage: InvestorOpportunityStage;
  riskRating: InvestorOpportunityRiskRating;
  licenseStatus?: string | null;
  summary: string;
  dueDiligenceDocuments: Array<{ title: string; url: string; type?: string; restricted?: boolean }>;
  riskIndicators: string[];
  analyticsSubscriptionEnabled: boolean;
  status: InvestorOpportunityStatus;
  publishedAt?: string | null;
  inquiryCount: number;
  site?: { id: string; name: string; state: string; lga?: string | null; community?: string | null; riskLevel?: string; siteStatus?: string } | null;
  sponsor?: { id: string; name?: string | null; email: string };
  inquiries?: InvestorOpportunityInquiry[];
  createdAt: string;
  updatedAt: string;
}

export interface InvestorOpportunityInquiry {
  id: string;
  investorId: string;
  investor?: { id: string; name?: string | null; email: string } | null;
  message: string;
  investmentRange?: string | null;
  contactPreference?: string | null;
  dueDiligenceConsent: boolean;
  analyticsSubscriptionInterest: boolean;
  status: InvestorOpportunityInquiryStatus;
  notes?: string | null;
  createdAt: string;
}

export interface InvestorOpportunityPayload {
  siteId?: string | null;
  title: string;
  mineralFocus: string[];
  capitalRequired?: number | null;
  investmentType: string;
  stage?: InvestorOpportunityStage;
  riskRating?: InvestorOpportunityRiskRating;
  licenseStatus?: string | null;
  summary: string;
  dueDiligenceDocuments?: Array<{ title: string; url: string; type?: string; restricted?: boolean }>;
  riskIndicators?: string[];
  analyticsSubscriptionEnabled?: boolean;
  status?: InvestorOpportunityStatus;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function buildQuery(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return params.toString();
}

export async function getInvestorOpportunities(filters: Record<string, string> = {}) {
  return apiClient.get<Paginated<InvestorOpportunity>>(`/api/investor-opportunities?${buildQuery(filters)}`);
}

export async function getInvestorOpportunity(id: string) {
  return apiClient.get<InvestorOpportunity>(`/api/investor-opportunities/${id}`);
}

export async function createInvestorOpportunity(payload: InvestorOpportunityPayload) {
  return apiClient.post<InvestorOpportunity>('/api/investor-opportunities', payload);
}

export async function updateInvestorOpportunity(id: string, payload: Partial<InvestorOpportunityPayload>) {
  return apiClient.patch<InvestorOpportunity>(`/api/investor-opportunities/${id}`, payload);
}

export async function createInvestorOpportunityInquiry(
  id: string,
  payload: {
    message: string;
    investmentRange?: string | null;
    contactPreference?: string | null;
    dueDiligenceConsent?: boolean;
    analyticsSubscriptionInterest?: boolean;
  },
) {
  return apiClient.post<InvestorOpportunityInquiry>(`/api/investor-opportunities/${id}/inquiries`, payload);
}

export async function updateInvestorOpportunityInquiry(
  id: string,
  payload: { status?: InvestorOpportunityInquiryStatus; notes?: string | null },
) {
  return apiClient.patch<InvestorOpportunityInquiry>(`/api/investor-opportunities/inquiries/${id}`, payload);
}
