/**
 * Contracts API Service
 * 
 * Placeholder service for contract-related endpoints.
 * To be implemented in future stories.
 */

import apiClient from './client';
import type { Contract, ContractStatus, ContractSignature, PaginatedResponse } from '../types';

/**
 * Get all contracts
 * TODO: Implement when contract endpoints are available
 */
export async function getContracts(params?: {
  status?: ContractStatus;
  limit?: number;
  offset?: number;
}): Promise<Contract[] | PaginatedResponse<Contract>> {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.offset) queryParams.append('offset', params.offset.toString());

  const query = queryParams.toString();
  const endpoint = `/api/contracts${query ? `?${query}` : ''}`;
  return apiClient.get<Contract[] | PaginatedResponse<Contract>>(endpoint);
}

/**
 * Get contract by ID
 * TODO: Implement when contract endpoints are available
 */
export async function getContract(id: string): Promise<Contract> {
  return apiClient.get<Contract>(`/api/contracts/${id}`);
}

/**
 * Create contract proposal
 * TODO: Implement when contract endpoints are available
 */
export async function createContractProposal(data: Partial<Contract>): Promise<Contract> {
  return apiClient.post<Contract>('/api/contracts', data);
}

/**
 * Update contract status
 * TODO: Implement when contract endpoints are available
 */
export async function updateContractStatus(
  id: string,
  status: ContractStatus,
): Promise<Contract> {
  return apiClient.patch<Contract>(`/api/contracts/${id}/status`, { status });
}

/**
 * Sign contract
 * TODO: Implement when contract endpoints are available
 */
export async function signContract(id: string, signature: ContractSignature): Promise<Contract> {
  return apiClient.post<Contract>(`/api/contracts/${id}/sign`, { signature });
}

/**
 * Get contract history
 * TODO: Implement when contract endpoints are available
 */
export async function getContractHistory(id: string): Promise<Contract[]> {
  return apiClient.get<Contract[]>(`/api/contracts/${id}/history`);
}

