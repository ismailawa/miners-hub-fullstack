/**
 * Contracts API Service
 * Handles all contract-related API calls
 */

import { get, post, patch } from "./client";
import type { Contract } from "@/lib/types";

// Re-export for convenience
export type { Contract } from "@/lib/types";

/**
 * Get contract by ID
 */
export async function getContract(id: string): Promise<Contract> {
  return get<Contract>(`/contracts/${id}`);
}

/**
 * Create contract proposal
 */
export async function createContractProposal(
  data: Partial<Contract>
): Promise<Contract> {
  return post<Contract>("/contracts", data);
}

/**
 * Sign contract
 */
export async function signContract(
  id: string,
  signature: string
): Promise<Contract> {
  return patch<Contract>(`/contracts/${id}/sign`, { signature });
}

