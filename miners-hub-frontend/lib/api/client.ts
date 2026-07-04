/**
 * Centralized API Client
 * 
 * Centralized HTTP client with interceptors, automatic token refresh,
 * error handling, and request cancellation support.
 */

import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  removeTokens,
} from './token';
import {
  type ApiError,
  createApiErrorFromResponse,
  createNetworkError,
  createTimeoutError,
  getUserFriendlyMessage,
} from './errors';
import type {
  RequestConfig,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
  InterceptorConfig,
  ApiClientConfig,
} from './types';

/**
 * Default configuration
 */
const DEFAULT_CONFIG: ApiClientConfig = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
  timeout: 10000, // 10 seconds
  defaultRetries: 1, // Max 1 retry
  interceptors: {
    request: [],
    response: [],
    error: [],
  },
};

/**
 * API Client Class
 */
class ApiClient {
  private config: ApiClientConfig;
  private abortControllers: Map<string, AbortController> = new Map();

  constructor(config?: Partial<ApiClientConfig>) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Add request interceptor
   */
  addRequestInterceptor(interceptor: RequestInterceptor): void {
    if (!this.config.interceptors) {
      this.config.interceptors = { request: [] };
    }
    if (!this.config.interceptors.request) {
      this.config.interceptors.request = [];
    }
    this.config.interceptors.request.push(interceptor);
  }

  /**
   * Add response interceptor
   */
  addResponseInterceptor(interceptor: ResponseInterceptor): void {
    if (!this.config.interceptors) {
      this.config.interceptors = { response: [] };
    }
    if (!this.config.interceptors.response) {
      this.config.interceptors.response = [];
    }
    this.config.interceptors.response.push(interceptor);
  }

  /**
   * Add error interceptor
   */
  addErrorInterceptor(interceptor: ErrorInterceptor): void {
    if (!this.config.interceptors) {
      this.config.interceptors = { error: [] };
    }
    if (!this.config.interceptors.error) {
      this.config.interceptors.error = [];
    }
    this.config.interceptors.error.push(interceptor);
  }

  /**
   * Set unauthorized handler
   */
  setOnUnauthorized(handler: () => void | Promise<void>): void {
    this.config.onUnauthorized = handler;
  }

  /**
   * Apply request interceptors
   */
  private async applyRequestInterceptors(
    config: RequestConfig,
  ): Promise<RequestConfig> {
    let processedConfig = { ...config };

    // Default request interceptor: Add auth token
    if (!processedConfig.skipAuth) {
      const token = getAccessToken();
      if (token) {
        const headers = new Headers(processedConfig.headers);
        headers.set('Authorization', `Bearer ${token}`);
        processedConfig.headers = headers;
      }
    }

    // Default request interceptor: Set Content-Type
    if (!processedConfig.headers) {
      processedConfig.headers = new Headers();
    }
    const headers = new Headers(processedConfig.headers);
    const isFormData =
      typeof FormData !== 'undefined' && processedConfig.body instanceof FormData;
    if (!headers.has('Content-Type') && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }
    processedConfig.headers = headers;

    // Apply custom request interceptors
    if (this.config.interceptors?.request) {
      for (const interceptor of this.config.interceptors.request) {
        processedConfig = await interceptor(processedConfig);
      }
    }

    return processedConfig;
  }

  /**
   * Apply response interceptors
   */
  private async applyResponseInterceptors<T>(
    response: Response,
  ): Promise<T> {
    let result: unknown = response;

    // Default response interceptor: Parse JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const text = await response.text();
      result = text ? JSON.parse(text) : {};
    }

    // Apply custom response interceptors
    if (this.config.interceptors?.response) {
      for (const interceptor of this.config.interceptors.response) {
        result = await interceptor<T>(response);
      }
    }

    return result as T;
  }

  /**
   * Apply error interceptors
   */
  private async applyErrorInterceptors(error: ApiError): Promise<ApiError> {
    let processedError = error;

    // Apply custom error interceptors
    if (this.config.interceptors?.error) {
      for (const interceptor of this.config.interceptors.error) {
        processedError = await interceptor(processedError);
      }
    }

    return processedError;
  }

  /**
   * Refresh access token
   */
  private async refreshToken(): Promise<string> {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) {
      throw createNetworkError('No refresh token available');
    }

    // Make refresh request without using the client to avoid recursion
    // Use skipAuth to prevent adding token (we're refreshing it)
    const response = await fetch(`${this.config.baseURL}/api/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken: refreshTokenValue }),
      credentials: 'include',
    });

    if (!response.ok) {
      // Refresh failed, clear tokens and trigger logout
      removeTokens();
      if (this.config.onUnauthorized) {
        await this.config.onUnauthorized();
      }
      throw createNetworkError('Session expired');
    }

    const data = await response.json();
    const newAccessToken = data.accessToken;

    // Update tokens
    const currentRefreshToken = getRefreshToken();
    if (currentRefreshToken) {
      setTokens(newAccessToken, currentRefreshToken);
    }

    return newAccessToken;
  }

  /**
   * Make API request
   */
  async request<T>(
    endpoint: string,
    config: RequestConfig = {},
  ): Promise<T> {
    const requestId = `${endpoint}-${Date.now()}-${Math.random()}`;
    const timeout = config.timeout ?? this.config.timeout ?? 10000;
    const maxRetries = config.retries ?? this.config.defaultRetries ?? 1;

    // Create abort controller for this request
    const controller = new AbortController();
    this.abortControllers.set(requestId, controller);

    // Apply request interceptors
    let processedConfig = await this.applyRequestInterceptors({
      ...config,
      signal: controller.signal,
      credentials: 'include',
    });

    const url = endpoint.startsWith('http')
      ? endpoint
      : `${this.config.baseURL}${endpoint}`;

    let lastError: ApiError | null = null;

    // Retry logic
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Set timeout
        const timeoutId = setTimeout(() => {
          controller.abort();
        }, timeout);

        try {
          const response = await fetch(url, processedConfig);

          clearTimeout(timeoutId);

          // Handle 401: Try to refresh token and retry
          if (response.status === 401 && attempt === 0 && !processedConfig.skipAuth) {
            try {
              await this.refreshToken();
              // Retry with new token
              processedConfig = await this.applyRequestInterceptors({
                ...config,
                signal: controller.signal,
                credentials: 'include',
              });
              continue;
            } catch (refreshError) {
              // Refresh failed, will be handled below
              const error = await createApiErrorFromResponse(response);
              throw error;
            }
          }

          // Handle error responses
          if (!response.ok) {
            const error = await createApiErrorFromResponse(response);
            const processedError = await this.applyErrorInterceptors(error);
            throw processedError;
          }

          // Apply response interceptors
          const result = await this.applyResponseInterceptors<T>(response);

          // Clean up
          this.abortControllers.delete(requestId);

          return result;
        } catch (error) {
          clearTimeout(timeoutId);

          // Handle abort (timeout)
          if (error instanceof Error && error.name === 'AbortError') {
            const timeoutError = createTimeoutError();
            const processedError = await this.applyErrorInterceptors(timeoutError);
            this.abortControllers.delete(requestId);
            throw processedError;
          }

          // Re-throw if it's already an ApiError
          if (error && typeof error === 'object' && 'status' in error) {
            const processedError = await this.applyErrorInterceptors(
              error as ApiError,
            );
            this.abortControllers.delete(requestId);
            throw processedError;
          }

          // Network error
          if (attempt === maxRetries) {
            const networkError = createNetworkError();
            const processedError = await this.applyErrorInterceptors(networkError);
            this.abortControllers.delete(requestId);
            throw processedError;
          }

          lastError = createNetworkError();
        }
      } catch (error) {
        if (error && typeof error === 'object' && 'status' in error) {
          lastError = error as ApiError;
          if (attempt === maxRetries) {
            this.abortControllers.delete(requestId);
            throw lastError;
          }
        } else {
          lastError = createNetworkError();
          if (attempt === maxRetries) {
            this.abortControllers.delete(requestId);
            throw lastError;
          }
        }
      }
    }

    // Should not reach here, but TypeScript needs it
    this.abortControllers.delete(requestId);
    throw lastError || createNetworkError();
  }

  /**
   * Cancel a request
   */
  cancelRequest(requestId: string): void {
    const controller = this.abortControllers.get(requestId);
    if (controller) {
      controller.abort();
      this.abortControllers.delete(requestId);
    }
  }

  /**
   * Cancel all pending requests
   */
  cancelAllRequests(): void {
    Array.from(this.abortControllers.values()).forEach(controller => {
      controller.abort();
    });
    this.abortControllers.clear();
  }

  /**
   * GET request
   */
  get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'GET' });
  }

  /**
   * POST request
   */
  post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'POST',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * PUT request
   */
  put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PUT',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * PATCH request
   */
  patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, {
      ...config,
      method: 'PATCH',
      body: data instanceof FormData ? data : JSON.stringify(data),
    });
  }

  /**
   * DELETE request
   */
  delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    return this.request<T>(endpoint, { ...config, method: 'DELETE' });
  }
}

/**
 * Create default API client instance
 */
const apiClient = new ApiClient();

/**
 * Export client instance and class
 */
export { ApiClient, apiClient };
export default apiClient;
