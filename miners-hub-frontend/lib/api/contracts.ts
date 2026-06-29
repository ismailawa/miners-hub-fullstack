/**
 * Contracts API Service
 *
 * Connects to the backend /api/contracts endpoints.
 */

import apiClient from './client';
import type { PaginatedResponse } from '../types';

export interface BackendContract {
  id: string;
  party1Id: string;
  party2Id: string;
  listingId?: string;
  title: string;
  terms: string;
  status: 'pending' | 'negotiating' | 'pending_signatures' | 'signed' | 'active' | 'completed' | 'cancelled' | 'rejected';
  party1SignedAt?: string;
  party2SignedAt?: string;
  party1SignatureData?: string;
  party2SignatureData?: string;
  startDate?: string;
  endDate?: string;
  value?: number;
  createdAt: string;
  updatedAt: string;
  party1?: { id: string; name: string; email: string };
  party2?: { id: string; name: string; email: string };
  listing?: { mineralType: string; price: number };
}

export interface ProposeContractPayload {
  party2Id: string;
  listingId?: string;
  title: string;
  terms: string;
  value?: number;
  startDate?: string;
  endDate?: string;
}

export interface SignContractPayload {
  signatureData: string; // base64 canvas data URL
}

export interface UpdateContractStatusPayload {
  status: BackendContract['status'];
}

/**
 * Get all contracts for the current user
 */
export async function getContracts(params?: {
  status?: BackendContract['status'];
  limit?: number;
  offset?: number;
}): Promise<PaginatedResponse<BackendContract>> {
  const query = new URLSearchParams();
  if (params?.status) query.append('status', params.status);
  if (params?.limit) query.append('limit', String(params.limit));
  if (params?.offset) query.append('offset', String(params.offset));
  return apiClient.get<PaginatedResponse<BackendContract>>(`/api/contracts?${query.toString()}`);
}

/**
 * Get a single contract by ID
 */
export async function getContract(id: string): Promise<BackendContract> {
  return apiClient.get<BackendContract>(`/api/contracts/${id}`);
}

/**
 * Propose a new contract to another party
 */
export async function proposeContract(data: ProposeContractPayload): Promise<BackendContract> {
  return apiClient.post<BackendContract>('/api/contracts', data);
}

/**
 * Sign a contract
 */
export async function signContract(id: string, payload: SignContractPayload): Promise<BackendContract> {
  return apiClient.post<BackendContract>(`/api/contracts/${id}/sign`, payload);
}

/**
 * Update contract status (accept/reject/complete)
 */
export async function updateContractStatus(id: string, status: BackendContract['status']): Promise<BackendContract> {
  return apiClient.patch<BackendContract>(`/api/contracts/${id}/status`, { status });
}
