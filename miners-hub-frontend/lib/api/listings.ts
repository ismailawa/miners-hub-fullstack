/**
 * Listings API Service
 * 
 * Connects to the backend /api/listings endpoints.
 */

import apiClient from './client';
import { Listing, Auction, ListingStatus, AuctionStatus, PaginatedResponse, Unit } from '../types';

export interface BackendListing {
  id: string;
  minerId: string;
  mineralType: string;
  quantity: number;
  price: number;
  gradePurity?: string | null;
  location?: string | null;
  listingType: 'buy_now' | 'auction';
  status: string;
  moisturePercentage?: number | null;
  description?: string | null;
  images?: string[];
  createdAt: string;
  updatedAt: string;
  miner?: {
    id: string;
    companyName: string;
    user?: {
      id: string;
      name: string;
      email: string;
      profileImageUrl?: string | null;
    };
  };
}

export interface CreateListingPayload {
  mineralType: string;
  quantity: number;
  price: number;
  gradePurity?: string;
  location?: string;
  listingType: 'buy_now' | 'auction';
  images?: string[];
}

/**
 * Create a new listing (submitted for admin approval)
 */
export async function createListing(payload: CreateListingPayload): Promise<BackendListing> {
  return apiClient.post<BackendListing>('/api/listings', payload as any);
}

/**
 * Get the current miner's own listings
 */
export async function getMyListings(): Promise<BackendListing[]> {
  return apiClient.get<BackendListing[]>('/api/listings/my/all');
}

export interface ListingFilterPayload {
  offset?: number;
  limit?: number;
  mineralType?: string;
  location?: string;
  minPrice?: number;
  maxPrice?: number;
  listingType?: 'buy_now' | 'auction';
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
 * Get all published listings for the marketplace
 */
export async function getPublishedListings(filters?: ListingFilterPayload): Promise<PaginatedResponse<BackendListing>> {
  const query = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        // Backend DTO uses `rawOffset` for direct offset, `limit` maps directly
        const paramKey = key === 'offset' ? 'rawOffset' : key;
        query.append(paramKey, String(value));
      }
    });
  }
  const queryString = query.toString();
  const endpoint = queryString ? `/api/listings?${queryString}` : '/api/listings';
  const response = await apiClient.get<BackendPaginatedResponse<BackendListing> | PaginatedResponse<BackendListing>>(endpoint);
  return normalizePaginatedResponse(response);
}

/**
 * Update a listing (resets status to SUBMITTED for re-approval)
 */
export async function updateListing(id: string, payload: Partial<CreateListingPayload>): Promise<BackendListing> {
  return apiClient.patch<BackendListing>(`/api/listings/${id}`, payload as any);
}

/**
 * Delete a listing
 */
export async function deleteListing(id: string): Promise<void> {
  return apiClient.delete<void>(`/api/listings/${id}`);
}

/**
 * Maps a BackendListing to the frontend's Listing type.
 */
export function mapBackendListingToFrontend(b: BackendListing): Listing {
  return {
    id: b.id,
    minerId: b.minerId,
    minerUserId: b.miner?.user?.id,
    mineral: b.mineralType,
    quantity: Number(b.quantity),
    unit: 'tonne' as Unit, // default for now, could be dynamic
    pricePerUnit: Number(b.price),
    grade: b.gradePurity || 'Standard',
    location: b.location || 'Nigeria',
    description: b.description || 'No description provided.',
    images: b.images?.length
      ? b.images
      : ['https://images.unsplash.com/photo-1516924962500-2b4b3b99ea02?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3'],
    status: b.status as ListingStatus,
    type: b.listingType === 'buy_now' ? 'buy-now' : 'auction',
    datePosted: b.createdAt,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    minerName: b.miner?.companyName || 'Unknown Miner',
    minerImageUrl: b.miner?.user?.profileImageUrl || 'https://ui-avatars.com/api/?name=Miner',
  };
}

/**
 * Maps a BackendListing to the frontend's Auction type.
 * Note: backend doesn't fully support Auction table in standard listing get, 
 * but for the marketplace view, we map the listing properties.
 */
export function mapBackendListingToAuction(b: BackendListing): Auction {
  return {
    id: b.id,
    minerId: b.minerId,
    minerUserId: b.miner?.user?.id,
    mineral: b.mineralType,
    quantity: Number(b.quantity),
    unit: 'tonne' as Unit,
    startingBid: Number(b.price),
    currentBid: Number(b.price), // In reality, fetch from auctions API
    highestBidderId: null,
    auctionEndDate: new Date(new Date(b.createdAt).getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Dummy +7 days
    bidHistory: [],
    grade: b.gradePurity || 'Standard',
    location: b.location || 'Nigeria',
    description: b.description || 'No description provided.',
    images: b.images?.length
      ? b.images
      : ['https://images.unsplash.com/photo-1518349619113-03114f06ac3a?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3'],
    status: 'active' as AuctionStatus,
    datePosted: b.createdAt,
    createdAt: b.createdAt,
    updatedAt: b.updatedAt,
    minerName: b.miner?.companyName || 'Unknown Miner',
    minerImageUrl: b.miner?.user?.profileImageUrl || 'https://ui-avatars.com/api/?name=Miner',
  };
}
