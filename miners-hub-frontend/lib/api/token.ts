/**
 * Token management utilities
 * Handles storage and retrieval of JWT tokens
 */

const TOKEN_KEY = "miners-hub-token";
const REFRESH_TOKEN_KEY = "miners-hub-refresh-token";

/**
 * Get stored access token with expiration validation
 */
export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  // Validate token expiration if it's a JWT
  try {
    const parts = token.split(".");
    if (parts.length === 3) {
      const payload = JSON.parse(atob(parts[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        // Token expired, remove it
        removeTokens();
        return null;
      }
    }
  } catch {
    // Not a JWT or invalid format, assume it's valid
    // Backend will validate it
  }

  return token;
}

/**
 * Get stored refresh token
 */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

/**
 * Store tokens
 */
export function storeTokens(accessToken: string, refreshToken?: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, accessToken);
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/**
 * Remove tokens
 */
export function removeTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
}

