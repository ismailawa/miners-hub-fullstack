/**
 * Orders API Service
 * Handles all order-related API calls
 */

import { get } from "./client";
import type { Order } from "@/lib/types";

// Re-export for convenience
export type { Order } from "@/lib/types";

/**
 * Get order history
 */
export async function getOrderHistory(): Promise<Order[]> {
  return get<Order[]>("/orders");
}

/**
 * Get order by ID
 */
export async function getOrder(id: string): Promise<Order> {
  return get<Order>(`/orders/${id}`);
}

/**
 * Track order
 */
export async function trackOrder(id: string): Promise<Order> {
  return get<Order>(`/orders/${id}/track`);
}

