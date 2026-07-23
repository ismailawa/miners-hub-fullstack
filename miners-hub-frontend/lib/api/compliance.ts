import apiClient from './client';

export type LicenseStatus = 'submitted' | 'under_review' | 'approved' | 'rejected' | 'expired';
export type LicenseRenewalStatus = 'not_due' | 'due_soon' | 'in_progress' | 'renewed';
export type ComplianceCaseSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ComplianceCaseStatus = 'open' | 'inspection_scheduled' | 'action_required' | 'resolved' | 'closed';

export interface License {
  id: string;
  holderUserId: string;
  siteId?: string | null;
  licenseNumber: string;
  licenseType: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  status: LicenseStatus;
  renewalStatus: LicenseRenewalStatus;
  documentIds: string[];
  reviewNotes?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  holder?: { id: string; name?: string | null; email: string; role: string } | null;
  site?: { id: string; name: string; state: string; lga?: string | null; operatorName?: string | null } | null;
  expiry: { daysUntilExpiry: number; isExpired: boolean; isDueSoon: boolean };
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceCase {
  id: string;
  siteId: string;
  subjectUserId?: string | null;
  caseType: string;
  severity: ComplianceCaseSeverity;
  status: ComplianceCaseStatus;
  assignedTo?: string | null;
  findings: string;
  requiredActions?: Array<Record<string, any>> | null;
  dueDate?: string | null;
  inspectionScheduledAt?: string | null;
  inspectorName?: string | null;
  inspectionNotes?: string | null;
  closedAt?: string | null;
  site?: { id: string; name: string; state: string; lga?: string | null; operatorName?: string | null } | null;
  subjectUser?: { id: string; name?: string | null; email: string } | null;
  assignee?: { id: string; name?: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface LicensePayload {
  holderUserId?: string;
  siteId?: string | null;
  licenseNumber: string;
  licenseType: string;
  issuingAuthority: string;
  issueDate: string;
  expiryDate: string;
  documentIds?: string[];
}

export interface ComplianceCasePayload {
  siteId: string;
  subjectUserId?: string | null;
  caseType: string;
  severity?: ComplianceCaseSeverity;
  assignedTo?: string | null;
  findings: string;
  requiredActions?: Array<Record<string, any>>;
  dueDate?: string | null;
  inspectionScheduledAt?: string | null;
  inspectorName?: string | null;
  inspectionNotes?: string | null;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function getLicenses(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return apiClient.get<Paginated<License>>(`/api/licenses?${params.toString()}`);
}

export async function createLicense(payload: LicensePayload) {
  return apiClient.post<License>('/api/licenses', payload);
}

export async function updateLicense(id: string, payload: Partial<LicensePayload>) {
  return apiClient.patch<License>(`/api/licenses/${id}`, payload);
}

export async function reviewLicense(id: string, status: LicenseStatus, reviewNotes?: string) {
  return apiClient.patch<License>(`/api/licenses/${id}/status`, { status, reviewNotes });
}

export async function getComplianceCases(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return apiClient.get<Paginated<ComplianceCase>>(`/api/compliance-cases?${params.toString()}`);
}

export async function createComplianceCase(payload: ComplianceCasePayload) {
  return apiClient.post<ComplianceCase>('/api/compliance-cases', payload);
}

export async function updateComplianceCase(id: string, payload: Partial<ComplianceCasePayload> & { status?: ComplianceCaseStatus }) {
  return apiClient.patch<ComplianceCase>(`/api/compliance-cases/${id}`, payload);
}
