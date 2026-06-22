/**
 * Token Management Utilities
 * 
 * Centralized token storage and management functions.
 * Extracted from auth.ts for better separation of concerns.
 */

const TOKEN_KEY = 'miners-hub-token';
const REFRESH_TOKEN_KEY = 'miners-hub-refresh-token';

/**
 * Get access token from storage
 */
export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;
  
  // Validate token expiration (if JWT)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      removeTokens();
      return null;
    }
  } catch {
    // Not a JWT or invalid format - continue
  }
  
  return token;
}

/**
 * Get refresh token from storage
 */
export function getRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store access and refresh tokens
 */
export function setTokens(accessToken: string, refreshToken: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

/**
 * Remove tokens from storage
 */
export function removeTokens(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

/**
 * Check if user has a valid token
 */
export function hasValidToken(): boolean {
  return getAccessToken() !== null;
}

