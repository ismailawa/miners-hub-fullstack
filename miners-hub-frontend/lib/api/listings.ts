/**
 * Listings API Service
 * 
 * Placeholder service for marketplace listing endpoints.
 * To be implemented in future stories.
 */

import apiClient from './client';
import type { Listing, ListingStatus, PaginatedResponse } from '../types';

/**
 * Get all listings
 * TODO: Implement when listing endpoints are available
 */
export async function getListings(params?: {
  status?: ListingStatus;
  mineralType?: string;
  limit?: number;
  offset?: number;
}): Promise<Listing[] | PaginatedResponse<Listing>> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.mineralType) queryParams.append('mineralType', params.mineralType);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const query = queryParams.toString();
  const endpoint = `/api/listings${query ? `?${query}` : ''}`;
  return apiClient.get<Listing[] | PaginatedResponse<Listing>>(endpoint);
}

/**
 * Get listing by ID
 * TODO: Implement when listing endpoints are available
 */
export async function getListing(id: string): Promise<Listing> {
  return apiClient.get<Listing>(`/api/listings/${id}`);
}

/**
 * Create listing
 * TODO: Implement when listing endpoints are available
 */
export async function createListing(data: Partial<Listing>): Promise<Listing> {
  return apiClient.post<Listing>('/api/listings', data);
}

/**
 * Update listing
 * TODO: Implement when listing endpoints are available
 */
export async function updateListing(id: string, data: Partial<Listing>): Promise<Listing> {
  return apiClient.put<Listing>(`/api/listings/${id}`, data);
}

/**
 * Delete listing
 * TODO: Implement when listing endpoints are available
 */
export async function deleteListing(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/listings/${id}`);
}

