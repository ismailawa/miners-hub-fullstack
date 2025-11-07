/**
 * Users API Service
 * Handles all user-related API calls
 */

import { get, put, patch } from "./client";
import type { User, Miner, Investor } from "@/lib/types";

// Re-export for convenience
export type { User, Miner, Investor } from "@/lib/types";

// UserProfile is the same as User
export type UserProfile = User;

/**
 * Get user profile
 */
export async function getUserProfile(userId: string): Promise<UserProfile> {
  return get<UserProfile>(`/users/${userId}`);
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  userId: string,
  data: Partial<UserProfile>
): Promise<UserProfile> {
  return put<UserProfile>(`/users/${userId}`, data);
}

