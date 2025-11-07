/**
 * Centralized API Client
 * Provides a consistent interface for all API requests with interceptors,
 * error handling, token management, and automatic retry logic.
 */

import {
  ApiError,
  ApiRequestConfig,
  ApiResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from "./types";
import { getAccessToken, getRefreshToken, storeTokens, removeTokens } from "./token";
import { createApiError, isTimeoutError } from "./errors";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

const DEFAULT_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 1; // Maximum retry attempts

// Interceptors
let requestInterceptors: RequestInterceptor[] = [];
let responseInterceptors: ResponseInterceptor[] = [];
let errorInterceptors: ErrorInterceptor[] = [];

/**
 * Add request interceptor
 */
export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor);
}

/**
 * Add response interceptor
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor);
}

/**
 * Add error interceptor
 */
export function addErrorInterceptor(interceptor: ErrorInterceptor) {
  errorInterceptors.push(interceptor);
}

/**
 * Remove interceptor
 */
export function removeInterceptor(interceptor: RequestInterceptor | ResponseInterceptor | ErrorInterceptor) {
  requestInterceptors = requestInterceptors.filter((i) => i !== interceptor);
  responseInterceptors = responseInterceptors.filter((i) => i !== interceptor);
  errorInterceptors = errorInterceptors.filter((i) => i !== interceptor);
}

/**
 * Apply request interceptors
 */
async function applyRequestInterceptors(config: ApiRequestConfig): Promise<ApiRequestConfig> {
  let finalConfig = { ...config };
  for (const interceptor of requestInterceptors) {
    finalConfig = await interceptor(finalConfig);
  }
  return finalConfig;
}

/**
 * Apply response interceptors
 */
async function applyResponseInterceptors<T>(response: Response): Promise<T> {
  const data = await response.json();
  let result: T = data as T;
  for (const interceptor of responseInterceptors) {
    result = await interceptor(result);
  }
  return result;
}

/**
 * Apply error interceptors
 */
async function applyErrorInterceptors(error: ApiError): Promise<never> {
  for (const interceptor of errorInterceptors) {
    await interceptor(error);
  }
  throw error;
}

/**
 * Refresh access token
 */
async function refreshAccessToken(): Promise<void> {
  const refreshTokenValue = getRefreshToken();
  if (!refreshTokenValue) {
    throw createApiError("No refresh token available", 401);
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ refreshToken: refreshTokenValue }),
  });

  if (!response.ok) {
    removeTokens();
    throw createApiError("Session expired. Please login again.", 401);
  }

  const data = await response.json();
  storeTokens(data.accessToken, data.refreshToken);
}

/**
 * Make API request with automatic token refresh and retry logic
 */
export async function apiRequest<T>(
  endpoint: string,
  config: ApiRequestConfig = {}
): Promise<T> {
  const {
    timeout = DEFAULT_TIMEOUT,
    retryCount = 0,
    skipAuth = false,
    ...fetchConfig
  } = config;

  // Apply request interceptors
  const finalConfig = await applyRequestInterceptors({
    timeout,
    retryCount,
    skipAuth,
    ...fetchConfig,
  });

  // Get token if not skipping auth
  const token = skipAuth ? null : getAccessToken();

  // Create headers
  const headers = new Headers(finalConfig.headers);
  headers.set("Content-Type", "application/json");

  if (token && !skipAuth) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set up request timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...finalConfig,
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Handle 401 - try to refresh token and retry
    if (response.status === 401 && retryCount < MAX_RETRIES && !skipAuth) {
      try {
        await refreshAccessToken();
        // Retry request with new token
        return apiRequest<T>(endpoint, {
          ...config,
          retryCount: retryCount + 1,
        });
      } catch (refreshError) {
        // Refresh failed, trigger logout
        removeTokens();
        const error = createApiError("Session expired. Please login again.", 401);
        return applyErrorInterceptors(error);
      }
    }

    // Handle error responses
    if (!response.ok) {
      const error: ApiError = {
        message: "An error occurred",
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.message || error.message;
        error.errors = errorData.errors;
      } catch {
        error.message = response.statusText || error.message;
      }

      return applyErrorInterceptors(error);
    }

    // Apply response interceptors
    return applyResponseInterceptors<T>(response);
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle timeout
    if (isTimeoutError(error)) {
      const timeoutError = createApiError(
        "Request timeout. Please try again.",
        408
      );
      return applyErrorInterceptors(timeoutError);
    }

    // Handle network errors
    if (error instanceof Error && error.name === "AbortError") {
      const networkError = createApiError(
        "Network error. Please check your connection.",
        0
      );
      return applyErrorInterceptors(networkError);
    }

    // Re-throw ApiError
    if (typeof error === "object" && error !== null && "status" in error) {
      return applyErrorInterceptors(error as ApiError);
    }

    // Unknown error
    const unknownError = createApiError(
      "An unexpected error occurred",
      500
    );
    return applyErrorInterceptors(unknownError);
  }
}

/**
 * GET request helper
 */
export function get<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
  return apiRequest<T>(endpoint, { ...config, method: "GET" });
}

/**
 * POST request helper
 */
export function post<T>(
  endpoint: string,
  data?: unknown,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...config,
    method: "POST",
    body: JSON.stringify(data),
  });
}

/**
 * PUT request helper
 */
export function put<T>(
  endpoint: string,
  data?: unknown,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...config,
    method: "PUT",
    body: JSON.stringify(data),
  });
}

/**
 * PATCH request helper
 */
export function patch<T>(
  endpoint: string,
  data?: unknown,
  config?: ApiRequestConfig
): Promise<T> {
  return apiRequest<T>(endpoint, {
    ...config,
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

/**
 * DELETE request helper
 */
export function del<T>(endpoint: string, config?: ApiRequestConfig): Promise<T> {
  return apiRequest<T>(endpoint, { ...config, method: "DELETE" });
}

