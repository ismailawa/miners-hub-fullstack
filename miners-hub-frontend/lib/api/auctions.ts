/**
 * Auctions API Service
 * Handles all auction-related API calls
 */

import { get, post, patch } from "./client";
import type { Auction, Bid } from "@/lib/types";

// Re-export for convenience
export type { Auction, Bid } from "@/lib/types";

/**
 * Get auction by ID
 */
export async function getAuction(id: string): Promise<Auction> {
  return get<Auction>(`/auctions/${id}`);
}

/**
 * Place a bid
 */
export async function placeBid(
  auctionId: string,
  amount: number
): Promise<Bid> {
  return post<Bid>(`/auctions/${auctionId}/bids`, { amount });
}

/**
 * Get auction status
 */
export async function getAuctionStatus(id: string): Promise<Auction> {
  return get<Auction>(`/auctions/${id}/status`);
}

