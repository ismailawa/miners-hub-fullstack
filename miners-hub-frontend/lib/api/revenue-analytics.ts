import apiClient from './client';
import { getAccessToken } from './token';

export interface RevenueAnalyticsFilters {
  period?: string;
  dateFrom?: string;
  dateTo?: string;
  mineral?: string;
  lga?: string;
  siteId?: string;
  status?: string;
}

export interface RevenueAnalytics {
  filters: Required<Record<'period' | 'dateFrom' | 'dateTo', string>> & {
    mineral: string | null;
    lga: string | null;
    siteId: string | null;
    status: string | null;
  };
  totals: {
    orderCount: number;
    orderGross: number;
    escrowGross: number;
    commissionRevenue: number;
    sellerNetPayout: number;
    refundedAmount: number;
    royaltyDue: number;
    approvedRoyaltyDue: number;
    governmentRevenue: number;
  };
  byMineral: Array<{
    mineral: string;
    orderCount: number;
    orderGross: number;
    commissionRevenue: number;
    royaltyDue: number;
  }>;
  byStatus: Array<{ status: string; count: number; amount: number }>;
  royaltyByLga: Array<{
    lga: string;
    reportCount: number;
    royaltyDue: number;
    approvedRoyaltyDue: number;
  }>;
  monthlyTrend: Array<{
    month: string;
    orderGross: number;
    commissionRevenue: number;
    royaltyDue: number;
    governmentRevenue: number;
  }>;
  recentTransactions: Array<{
    id: string;
    createdAt: string;
    mineralType: string;
    location?: string | null;
    status: string;
    paymentStatus: string;
    totalAmount: number;
    commissionAmount: number;
    escrowStatus?: string | null;
  }>;
}

function buildQuery(filters: RevenueAnalyticsFilters) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value && value !== 'all') params.set(key, value);
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function getRevenueAnalytics(filters: RevenueAnalyticsFilters = {}) {
  return apiClient.get<RevenueAnalytics>(`/api/analytics/revenue${buildQuery(filters)}`);
}

export async function downloadRevenueAnalyticsCsv(filters: RevenueAnalyticsFilters = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
  const token = getAccessToken();
  const response = await fetch(`${baseUrl}/api/analytics/revenue/export${buildQuery(filters)}`, {
    credentials: 'include',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!response.ok) throw new Error('Failed to export revenue report');
  return response.text();
}
