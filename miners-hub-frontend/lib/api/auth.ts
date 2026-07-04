/**
 * Authentication API Service
 * 
 * Refactored to use centralized API client.
 * Maintains backward compatibility with existing code.
 */

import apiClient from './client';
import { setTokens, removeTokens, getRefreshToken } from './token';
import type { ApiError } from './errors';
import type { User, UserRole } from '../types';

// Re-export token utilities for backward compatibility
export {
  getAccessToken,
  getRefreshToken,
  setTokens,
  removeTokens,
  hasValidToken,
} from './token';

// Re-export types for backward compatibility
export type { User, UserRole } from '../types';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Re-export ApiError for backward compatibility
export type { ApiError } from './errors';

/**
 * Login
 */
export async function login(
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiClient.post<any>('/api/auth/login', {
    email,
    password,
  });

  if (response.user?.verificationStatus && !response.user.status) {
    response.user.status = response.user.verificationStatus;
  }

  setTokens(response.accessToken, response.refreshToken);
  return response as AuthResponse;
}

/**
 * Register
 */
export async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthResponse> {
  const response = await apiClient.post<any>('/api/auth/register', {
    name,
    email,
    password,
  });

  if (response.user?.verificationStatus && !response.user.status) {
    response.user.status = response.user.verificationStatus;
  }

  setTokens(response.accessToken, response.refreshToken);
  return response as AuthResponse;
}

/**
 * Logout
 */
export async function logout(): Promise<void> {
  try {
    await apiClient.post('/api/auth/logout', {
      refreshToken: getRefreshToken(),
    });
  } catch (error) {
    // Continue with logout even if API call fails
    console.error('Logout API call failed:', error);
  } finally {
    removeTokens();
  }
}

/**
 * Get current user (token validation)
 */
export async function getCurrentUser(): Promise<AuthResponse['user']> {
  const response = await apiClient.get<{ user: any }>(
    '/api/auth/me',
  );
  if (response.user.verificationStatus && !response.user.status) {
    response.user.status = response.user.verificationStatus;
  }
  return response.user as AuthResponse['user'];
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<string> {
  const { getRefreshToken, setTokens } = await import('./token');
  const refreshTokenValue = getRefreshToken();
  
  if (!refreshTokenValue) {
    throw { message: 'No refresh token available', status: 401 } as ApiError;
  }

  const response = await apiClient.post<{ accessToken: string }>(
    '/api/auth/refresh',
    { refreshToken: refreshTokenValue },
  );

  // Update access token
  const currentRefreshToken = getRefreshToken();
  if (currentRefreshToken) {
    setTokens(response.accessToken, currentRefreshToken);
  }

  return response.accessToken;
}
