/**
 * Listings API Service
 * Handles all listing-related API calls
 */

import { get, post, put, patch, del } from "./client";
import type { Listing } from "@/lib/types";

// Re-export for convenience
export type { Listing } from "@/lib/types";

/**
 * Get all listings
 */
export async function getListings(): Promise<Listing[]> {
  return get<Listing[]>("/listings");
}

/**
 * Get listing by ID
 */
export async function getListing(id: string): Promise<Listing> {
  return get<Listing>(`/listings/${id}`);
}

/**
 * Create listing
 */
export async function createListing(data: Partial<Listing>): Promise<Listing> {
  return post<Listing>("/listings", data);
}

/**
 * Update listing
 */
export async function updateListing(
  id: string,
  data: Partial<Listing>
): Promise<Listing> {
  return put<Listing>(`/listings/${id}`, data);
}

/**
 * Delete listing
 */
export async function deleteListing(id: string): Promise<void> {
  return del<void>(`/listings/${id}`);
}

