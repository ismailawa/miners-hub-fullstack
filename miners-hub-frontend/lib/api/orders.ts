/**
 * Orders API Service
 *
 * Connects to the backend /api/orders endpoints.
 */

import apiClient from './client';
import type { Order, PaginatedResponse, Transaction } from '../types';

export interface BackendOrder {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  quantity: number;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  deliveryAddress?: string | null;
  statusHistory?: Array<{
    status: BackendOrder['status'];
    date: string;
    location?: string;
    notes?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  listing?: {
    mineralType: string;
    price: number;
    location?: string;
    miner?: { companyName: string; user?: { name: string } };
  };
  buyer?: { name: string; email: string };
  seller?: { name: string; email?: string };
  escrowTransaction?: BackendEscrowTransaction | null;
}

export interface BackendPayoutAccount {
  id: string;
  bankName: string;
  bankCode: string;
  accountName: string;
  accountNumberMasked: string;
  currency: string;
  status: 'pending' | 'active' | 'failed';
  flutterwaveSubaccountId?: string | null;
  failureReason?: string | null;
}

export interface BackendEscrowTransaction {
  id: string;
  orderId: string;
  grossAmount: number;
  commissionAmount: number;
  sellerNetAmount: number;
  currency: string;
  status:
    | 'pending_payment'
    | 'funded'
    | 'awaiting_release'
    | 'release_processing'
    | 'released'
    | 'refund_processing'
    | 'refunded'
    | 'failed';
  flutterwaveTxRef: string;
  flutterwaveTransactionId?: string | null;
  flutterwavePaymentLink?: string | null;
  flutterwavePaymentStatus?: string | null;
  sellerTransferStatus?: string;
  platformCommissionTransferStatus?: string;
  sellerPayoutAccount?: BackendPayoutAccount | null;
  fundedAt?: string | null;
  releasedAt?: string | null;
  refundedAt?: string | null;
}

export interface CreateOrderPayload {
  listingId: string;
  quantity: number;
  deliveryAddress: string;
}

export interface UpdateOrderStatusPayload {
  status: BackendOrder['status'];
}

interface BackendPaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function normalizePaginatedResponse<T>(
  response: BackendPaginatedResponse<T> | PaginatedResponse<T>,
): PaginatedResponse<T> {
  if ('meta' in response) return response;
  return {
    data: response.data,
    meta: {
      page: response.page,
      limit: response.limit,
      total: response.total,
      totalPages: response.totalPages,
      hasNext: response.page < response.totalPages,
      hasPrev: response.page > 1,
    },
  };
}

/**
 * Get all orders for the current user (both buying and selling)
 */
export async function getOrders(params?: {
  status?: BackendOrder['status'];
  role?: 'buyer' | 'seller';
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<BackendOrder>> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.role) query.append('role', params.role);
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.offset !== undefined) query.append('rawOffset', String(params.offset));
  const response = await apiClient.get<BackendPaginatedResponse<BackendOrder> | PaginatedResponse<BackendOrder>>(`/api/orders?${query.toString()}`);
  return normalizePaginatedResponse(response);
}

/**
 * Get a single order by ID
 */
export async function getOrder(id: string): Promise<BackendOrder> {
  return apiClient.get<BackendOrder>(`/api/orders/${id}`);
}

/**
 * Create a new order from a listing
 */
export async function createOrder(data: CreateOrderPayload): Promise<BackendOrder> {
  return apiClient.post<BackendOrder>('/api/orders', data);
}

/**
 * Simulate a payment event for an order
 */
export async function confirmPayment(orderId: string): Promise<BackendOrder> {
  return apiClient.post<BackendOrder>(`/api/orders/${orderId}/payment`, {});
}

export async function initiateEscrowPayment(orderId: string): Promise<{
  order: BackendOrder;
  escrow: BackendEscrowTransaction;
  paymentLink: string | null;
  txRef: string;
}> {
  return apiClient.post(`/api/orders/${orderId}/escrow/initiate`, {});
}

/**
 * Update order status (ship, deliver, cancel)
 */
export async function updateOrderStatus(id: string, status: BackendOrder['status']): Promise<BackendOrder> {
  return apiClient.patch<BackendOrder>(`/api/orders/${id}/status`, { status });
}

export async function cancelOrder(id: string): Promise<BackendOrder> {
  return apiClient.post<BackendOrder>(`/api/orders/${id}/cancel`, {});
}

export function mapBackendOrderToOrder(order: BackendOrder): Order {
  return {
    id: order.id,
    transactionId: order.id,
    listingId: order.listingId,
    mineral: order.listing?.mineralType || 'Mineral',
    quantity: Number(order.quantity),
    unit: 'tonne',
    totalAmount: Number(order.totalAmount),
    orderDate: order.createdAt,
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    status: order.status as Order['status'],
    shippingAddress: order.deliveryAddress || 'Not provided',
    statusHistory: (order.statusHistory || []).map((item) => ({
      status: item.status as Order['status'],
      date: item.date,
      location: item.location || order.listing?.location || '',
      notes: item.notes,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    buyerName: order.buyer?.name,
    sellerName: order.seller?.name,
  };
}

export function mapBackendOrderToTransaction(order: BackendOrder): Transaction {
  return {
    id: order.id,
    type: order.paymentStatus === 'refunded' ? 'refund' : 'order',
    listingId: order.listingId,
    orderId: order.id,
    mineral: order.listing?.mineralType || 'Mineral',
    amount: Number(order.totalAmount),
    quantity: Number(order.quantity),
    unit: 'tonne',
    date: order.updatedAt || order.createdAt,
    status: order.paymentStatus === 'paid' ? 'completed' : order.paymentStatus === 'refunded' ? 'failed' : 'pending',
    buyerId: order.buyerId,
    sellerId: order.sellerId,
    createdAt: order.createdAt,
    sellerName: order.seller?.name,
  };
}
