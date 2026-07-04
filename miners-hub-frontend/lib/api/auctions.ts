/**
 * Auctions API Service
 *
 * Connects to the backend /api/auctions endpoints.
 */

import apiClient from './client';
import type { Auction, AuctionStatus, PaginatedResponse, Unit } from '../types';

export interface BackendAuction {
  id: string;
  listingId: string;
  startingBid: number;
  minimumIncrement: number;
  currentBid?: number | null;
  status: 'active' | 'completed' | 'cancelled';
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
  listing?: {
    id: string;
    minerId: string;
    mineralType: string;
    quantity: number;
    price?: number;
    location?: string;
    gradePurity?: string;
    miner?: {
      id: string;
      companyName: string;
      user?: { id: string; name: string; profileImageUrl?: string };
    };
  };
  bids?: BackendBid[];
}

export interface BackendBid {
  id: string;
  auctionId: string;
  bidderId: string;
  amount: number;
  createdAt: string;
  bidder?: { name: string };
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
 * Get all active auctions
 */
export async function getActiveAuctions(params?: {
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<BackendAuction>> {
  const query = new URLSearchParams();
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.offset !== undefined) query.append('rawOffset', String(params.offset));
  const response = await apiClient.get<BackendPaginatedResponse<BackendAuction> | PaginatedResponse<BackendAuction>>(
    `/api/auctions${query.toString() ? `?${query.toString()}` : ''}`,
  );
  return normalizePaginatedResponse(response);
}

/**
 * Get auction by ID
 */
export async function getAuction(id: string): Promise<BackendAuction> {
  return apiClient.get<BackendAuction>(`/api/auctions/${id}`);
}

/**
 * Place a bid on an auction
 */
export async function placeBid(auctionId: string, amount: number): Promise<BackendBid> {
  return apiClient.post<BackendBid>(`/api/auctions/${auctionId}/bids`, { amount });
}

/**
 * Get bids for an auction
 */
export async function getAuctionBids(auctionId: string): Promise<BackendBid[]> {
  const response = await apiClient.get<BackendPaginatedResponse<BackendBid> | BackendBid[]>(
    `/api/auctions/${auctionId}/bids`,
  );
  return Array.isArray(response) ? response : response.data;
}

export function mapBackendAuctionToFrontend(auction: BackendAuction): Auction {
  const bidHistory = (auction.bids || []).map((bid) => ({
    id: bid.id,
    auctionId: bid.auctionId,
    bidderId: bid.bidderId,
    amount: Number(bid.amount),
    date: bid.createdAt,
    createdAt: bid.createdAt,
    bidderName: bid.bidder?.name,
  }));
  const highestBid = bidHistory[0];
  return {
    id: auction.id,
    minerId: auction.listing?.minerId || auction.listing?.miner?.id || '',
    minerUserId: auction.listing?.miner?.user?.id,
    mineral: auction.listing?.mineralType || 'Mineral',
    quantity: Number(auction.listing?.quantity || 0),
    unit: 'tonne' as Unit,
    startingBid: Number(auction.startingBid),
    currentBid: Number(auction.currentBid || auction.startingBid),
    highestBidderId: highestBid?.bidderId || null,
    auctionEndDate: auction.endTime,
    bidHistory,
    grade: auction.listing?.gradePurity || 'Standard',
    location: auction.listing?.location || 'Nigeria',
    description: 'Auction listing on Miners Hub.',
    images: [
      'https://images.unsplash.com/photo-1518349619113-03114f06ac3a?auto=format&fit=crop&q=80&w=2940&ixlib=rb-4.0.3',
    ],
    status: (auction.status === 'completed' ? 'ended' : auction.status) as AuctionStatus,
    datePosted: auction.createdAt,
    createdAt: auction.createdAt,
    updatedAt: auction.updatedAt,
    minerName: auction.listing?.miner?.companyName || auction.listing?.miner?.user?.name || 'Unknown Miner',
    minerImageUrl: auction.listing?.miner?.user?.profileImageUrl || 'https://ui-avatars.com/api/?name=Miner',
    highestBidderName: highestBid?.bidderName,
  };
}
