/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import { post, get } from "./client";
import { storeTokens } from "./token";
import type { User, UserRole } from "@/lib/types";
import { ApiError } from "./types";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user: User;
}

// Re-export types for backward compatibility
export type { User } from "@/lib/types";
export type { ApiError } from "./types";

// Re-export token functions for backward compatibility
export {
  getAccessToken,
  getRefreshToken,
  storeTokens,
  removeTokens,
} from "./token";

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<AuthResponse> {
  const response = await post<AuthResponse>("/auth/login", credentials, {
    skipAuth: true,
  });

  storeTokens(response.accessToken, response.refreshToken);
  return response;
}

/**
 * Register new user
 */
export async function register(
  data: RegisterRequest
): Promise<AuthResponse> {
  const response = await post<AuthResponse>("/auth/register", data, {
    skipAuth: true,
  });

  storeTokens(response.accessToken, response.refreshToken);
  return response;
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
  try {
    await post("/auth/logout", {});
  } catch (error) {
    // Even if logout fails on server, clear local tokens
    console.error("Logout error:", error);
  } finally {
    const { removeTokens } = await import("./token");
    removeTokens();
  }
}

/**
 * Get current user (token validation)
 */
export async function getCurrentUser(): Promise<User> {
  return get<User>("/auth/me");
}

/**
 * Refresh access token
 */
export async function refreshToken(): Promise<AuthResponse> {
  const { getRefreshToken, storeTokens } = await import("./token");
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw new Error("No refresh token available");
  }

  const response = await post<AuthResponse>(
    "/auth/refresh",
    { refreshToken: refreshTokenValue },
    { skipAuth: true }
  );

  storeTokens(response.accessToken, response.refreshToken);
  return response;
}
