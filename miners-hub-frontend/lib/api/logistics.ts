import apiClient from './client';

export type LogisticsProviderStatus = 'pending' | 'active' | 'suspended';
export type LogisticsQuoteStatus = 'requested' | 'quoted' | 'accepted' | 'declined';
export type ShipmentStatus = 'quote_requested' | 'scheduled' | 'picked_up' | 'in_transit' | 'at_checkpoint' | 'delivered' | 'disputed' | 'cancelled';

export interface LogisticsProvider {
  id: string;
  userId?: string | null;
  companyName: string;
  serviceAreas: string[];
  capabilities: string[];
  status: LogisticsProviderStatus;
  contactEmail?: string | null;
  contactPhone?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LogisticsQuoteRequest {
  id: string;
  requesterUserId?: string | null;
  orderId?: string | null;
  origin: string;
  destination: string;
  commodity: string;
  weight: number;
  containerType: string;
  contactName: string;
  contactEmail: string;
  status: LogisticsQuoteStatus;
  quotedAmount?: number | null;
  quoteNotes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Shipment {
  id: string;
  trackingId: string;
  orderId: string;
  providerId?: string | null;
  mineralPassportId?: string | null;
  quoteAmount?: number | null;
  pickupLocation: string;
  deliveryLocation: string;
  status: ShipmentStatus;
  currentMilestone?: string | null;
  milestones: Array<{
    status: ShipmentStatus;
    location?: string;
    notes?: string;
    occurredAt: string;
  }>;
  handoffEvidence?: Record<string, any> | null;
  deliveredAt?: string | null;
  provider?: { id: string; companyName: string; status: string; contactEmail?: string | null } | null;
  order?: { id: string; buyerId: string; sellerId: string; listingId: string; status: string } | null;
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

export interface QuoteRequestPayload {
  orderId?: string | null;
  origin: string;
  destination: string;
  commodity: string;
  weight: number;
  containerType: string;
  contactName: string;
  contactEmail: string;
}

export async function createLogisticsQuoteRequest(payload: QuoteRequestPayload) {
  return apiClient.post<LogisticsQuoteRequest>('/api/logistics/quote-requests', payload);
}

export async function getLogisticsQuoteRequests(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return apiClient.get<Paginated<LogisticsQuoteRequest>>(`/api/logistics/quote-requests?${params.toString()}`);
}

export async function updateLogisticsQuoteRequest(id: string, payload: Partial<Pick<LogisticsQuoteRequest, 'status' | 'quotedAmount' | 'quoteNotes'>>) {
  return apiClient.patch<LogisticsQuoteRequest>(`/api/logistics/quote-requests/${id}`, payload);
}

export async function getLogisticsProviders() {
  return apiClient.get<LogisticsProvider[]>('/api/logistics/providers');
}

export async function createLogisticsProvider(payload: Omit<LogisticsProvider, 'id' | 'createdAt' | 'updatedAt'>) {
  return apiClient.post<LogisticsProvider>('/api/logistics/providers', payload);
}

export async function getShipments(filters: Record<string, string> = {}) {
  const params = new URLSearchParams({ limit: '100' });
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  return apiClient.get<Paginated<Shipment>>(`/api/logistics/shipments?${params.toString()}`);
}

export async function createShipment(payload: {
  orderId: string;
  providerId?: string | null;
  mineralPassportId?: string | null;
  quoteAmount?: number | null;
  pickupLocation: string;
  deliveryLocation: string;
}) {
  return apiClient.post<Shipment>('/api/logistics/shipments', payload);
}

export async function trackShipment(trackingId: string) {
  return apiClient.get<Shipment>(`/api/logistics/shipments/track/${trackingId}`);
}

export async function updateShipmentStatus(id: string, payload: {
  status: ShipmentStatus;
  location?: string;
  notes?: string;
  handoffEvidence?: Record<string, any> | null;
}) {
  return apiClient.patch<Shipment>(`/api/logistics/shipments/${id}/status`, payload);
}
