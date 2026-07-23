import apiClient from './client';
import { VerificationStatus } from '../types';

export interface KycStatus {
  status: VerificationStatus;
  verificationStatus: VerificationStatus;
  onboardingComplete: boolean;
  metamapIdentityId?: string | null;
  metamapVerificationId?: string | null;
  kycSubmittedAt?: string | null;
  kycVerifiedAt?: string | null;
  kycRejectedAt?: string | null;
}

export interface MetaMapEventPayload {
  identityId?: string;
  verificationId?: string;
  payload?: Record<string, unknown>;
}

export async function startMetaMap(payload: MetaMapEventPayload): Promise<KycStatus> {
  return apiClient.post<KycStatus>('/api/kyc/metamap/start', payload);
}

export async function completeMetaMap(payload: MetaMapEventPayload): Promise<KycStatus> {
  return apiClient.post<KycStatus>('/api/kyc/metamap/complete', payload);
}

export async function getKycStatus(): Promise<KycStatus> {
  return apiClient.get<KycStatus>('/api/kyc/status');
}
