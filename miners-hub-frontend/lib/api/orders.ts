/**
 * Orders API Service
 * 
 * Placeholder service for order-related endpoints.
 * To be implemented in future stories.
 */

import apiClient from './client';
import type { Order, OrderStatus, PaginatedResponse } from '../types';

/**
 * Get all orders
 * TODO: Implement when order endpoints are available
 */
export async function getOrders(params?: {
  status?: OrderStatus;
  limit?: number;
  offset?: number;
}): Promise<Order[] | PaginatedResponse<Order>> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const query = queryParams.toString();
  const endpoint = `/api/orders${query ? `?${query}` : ''}`;
  return apiClient.get<Order[] | PaginatedResponse<Order>>(endpoint);
}

/**
 * Get order by ID
 * TODO: Implement when order endpoints are available
 */
export async function getOrder(id: string): Promise<Order> {
  return apiClient.get<Order>(`/api/orders/${id}`);
}

/**
 * Create order (checkout)
 * TODO: Implement when order endpoints are available
 */
export async function createOrder(data: Partial<Order>): Promise<Order> {
  return apiClient.post<Order>('/api/orders', data);
}

/**
 * Update order status
 * TODO: Implement when order endpoints are available
 */
export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  return apiClient.patch<Order>(`/api/orders/${id}/status`, { status });
}

