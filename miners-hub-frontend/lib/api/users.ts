/**
 * Users API Service
 * 
 * Placeholder service for user-related endpoints.
 * To be implemented in future stories.
 */

import apiClient from './client';
import type { User, Miner, Investor } from '../types';

/**
 * Get user profile
 * TODO: Implement when user profile endpoints are available
 */
export async function getProfile(userId?: string): Promise<User> {
  const endpoint = userId
    ? `/api/users/${userId}/profile`
    : '/api/users/profile';
  return apiClient.get<User>(endpoint);
}

/**
 * Update user profile
 * TODO: Implement when user profile endpoints are available
 */
export async function updateProfile(data: Partial<User>): Promise<User> {
  const response = await apiClient.put<any>('/api/users/profile', data);
  // Map backend's verificationStatus to frontend's status
  if (response.verificationStatus && !response.status) {
    response.status = response.verificationStatus;
  }
  return response as User;
}

/**
 * Get miner profile
 * TODO: Implement when miner endpoints are available
 */
export async function getMinerProfile(minerId: string): Promise<Miner> {
  return apiClient.get<Miner>(`/api/miners/${minerId}`);
}

/**
 * Get investor profile
 * TODO: Implement when investor endpoints are available
 */
export async function getInvestorProfile(investorId: string): Promise<Investor> {
  return apiClient.get<Investor>(`/api/investors/${investorId}`);
}

