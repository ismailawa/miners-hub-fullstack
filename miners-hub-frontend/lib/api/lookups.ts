import apiClient from './client';

export type LookupResource =
  | 'users'
  | 'miners'
  | 'mine-sites'
  | 'licenses'
  | 'listings'
  | 'orders'
  | 'production-reports'
  | 'lab-results'
  | 'mineral-passports'
  | 'logistics-providers'
  | 'shipments'
  | 'documents';

export interface LookupOption {
  id: string;
  label: string;
  description?: string;
  badge?: string;
  metadata?: Record<string, any>;
}

export interface LookupParams {
  resource: LookupResource;
  q?: string;
  limit?: number;
  siteId?: string;
  minerId?: string;
  listingId?: string;
  orderId?: string;
}

export async function searchLookup(params: LookupParams): Promise<LookupOption[]> {
  const query = new URLSearchParams({
    resource: params.resource,
    q: params.q || '',
    limit: String(params.limit || 20),
  });

  if (params.siteId) query.set('siteId', params.siteId);
  if (params.minerId) query.set('minerId', params.minerId);
  if (params.listingId) query.set('listingId', params.listingId);
  if (params.orderId) query.set('orderId', params.orderId);

  return apiClient.get<LookupOption[]>(`/api/lookups?${query.toString()}`);
}
