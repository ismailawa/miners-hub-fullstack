/**
 * Auctions API Service
 * 
 * Placeholder service for auction-related endpoints.
 * To be implemented in future stories.
 */

import apiClient from './client';
import type { Auction, Bid } from '../types';

/**
 * Get auction by ID
 * TODO: Implement when auction endpoints are available
 */
export async function getAuction(id: string): Promise<Auction> {
  return apiClient.get<Auction>(`/api/auctions/${id}`);
}

/**
 * Place bid on auction
 * TODO: Implement when auction endpoints are available
 */
export async function placeBid(auctionId: string, amount: number): Promise<Bid> {
  return apiClient.post<Bid>(`/api/auctions/${auctionId}/bids`, { amount });
}

/**
 * Get auction bids
 * TODO: Implement when auction endpoints are available
 */
export async function getAuctionBids(auctionId: string): Promise<Bid[]> {
  return apiClient.get<Bid[]>(`/api/auctions/${auctionId}/bids`);
}

