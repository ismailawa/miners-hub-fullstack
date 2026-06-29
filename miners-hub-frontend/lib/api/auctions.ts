/**
 * Auctions API Service
 *
 * Connects to the backend /api/auctions endpoints.
 */

import apiClient from './client';
import type { PaginatedResponse } from '../types';

export interface BackendAuction {
  id: string;
  listingId: string;
  startingPrice: number;
  reservePrice?: number;
  currentHighestBid?: number;
  status: 'active' | 'ended' | 'cancelled';
  endTime: string;
  createdAt: string;
  listing?: {
    id: string;
    mineralType: string;
    quantity: number;
    location?: string;
    gradePurity?: string;
    miner?: {
      companyName: string;
      user?: { name: string; profileImageUrl?: string };
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

/**
 * Get all active auctions
 */
export async function getActiveAuctions(): Promise<PaginatedResponse<BackendAuction>> {
  return apiClient.get<PaginatedResponse<BackendAuction>>('/api/auctions?status=active');
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
  return apiClient.get<BackendBid[]>(`/api/auctions/${auctionId}/bids`);
}
