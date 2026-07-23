import apiClient from './client';

export type EnvironmentalRecordType = 'inspection' | 'incident' | 'community_concern' | 'monitoring' | 'remediation';
export type EnvironmentalSeverity = 'low' | 'medium' | 'high' | 'critical';
export type EnvironmentalRecordStatus = 'open' | 'under_review' | 'action_required' | 'in_remediation' | 'resolved' | 'closed';

export interface EnvironmentalRecord {
  id: string;
  siteId: string;
  reportedBy: string;
  recordType: EnvironmentalRecordType;
  severity: EnvironmentalSeverity;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  evidenceUrls: string[];
  status: EnvironmentalRecordStatus;
  assignedTo?: string | null;
  remediationActions: Array<Record<string, any>>;
  communityVisible: boolean;
  privateNotes?: string | null;
  resolvedAt?: string | null;
  site?: { id: string; name: string; state: string; lga?: string | null; community?: string | null } | null;
  reporter?: { id: string; name?: string | null; email: string } | null;
  assignee?: { id: string; name?: string | null; email: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface EnvironmentalRecordPayload {
  siteId: string;
  recordType: EnvironmentalRecordType;
  severity?: EnvironmentalSeverity;
  description: string;
  latitude?: number | null;
  longitude?: number | null;
  evidenceUrls?: string[];
  assignedTo?: string | null;
  remediationActions?: Array<Record<string, any>>;
  communityVisible?: boolean;
  privateNotes?: string | null;
}

interface Paginated<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const withParams = (base: string, filters: Record<string, string> = {}) => {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return `${base}?${params.toString()}`;
};

export async function getEnvironmentalRecords(filters: Record<string, string> = {}) {
  return apiClient.get<Paginated<EnvironmentalRecord>>(withParams('/api/environmental-records', filters));
}

export async function getCommunityEnvironmentalRecords(filters: Record<string, string> = {}) {
  return apiClient.get<Paginated<EnvironmentalRecord>>(withParams('/api/environmental-records/community', filters), { skipAuth: true });
}

export async function createEnvironmentalRecord(payload: EnvironmentalRecordPayload) {
  return apiClient.post<EnvironmentalRecord>('/api/environmental-records', payload);
}

export async function updateEnvironmentalRecord(id: string, payload: Partial<EnvironmentalRecordPayload> & { status?: EnvironmentalRecordStatus }) {
  return apiClient.patch<EnvironmentalRecord>(`/api/environmental-records/${id}`, payload);
}
