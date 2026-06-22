/**
 * Common Types and Interfaces
 * 
 * Shared types used across all API services.
 */

import type { ApiError } from './errors';

/**
 * HTTP Methods
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

/**
 * Request configuration options
 */
export interface RequestConfig extends RequestInit {
  method?: HttpMethod;
  timeout?: number; // Override default timeout (ms)
  retries?: number; // Override default retry count
  skipAuth?: boolean; // Skip adding auth token
  skipErrorHandling?: boolean; // Skip global error handling
}

/**
 * Response wrapper
 */
export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Headers;
}

/**
 * Request interceptor function type
 */
export type RequestInterceptor = (
  config: RequestConfig,
) => RequestConfig | Promise<RequestConfig>;

/**
 * Response interceptor function type
 */
export type ResponseInterceptor = <T>(
  response: Response,
) => Promise<T> | T;

/**
 * Error interceptor function type
 */
export type ErrorInterceptor = (error: ApiError) => ApiError | Promise<ApiError>;

/**
 * Interceptor configuration
 */
export interface InterceptorConfig {
  request?: RequestInterceptor[];
  response?: ResponseInterceptor[];
  error?: ErrorInterceptor[];
}

/**
 * API Client configuration
 */
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
  defaultRetries?: number;
  interceptors?: InterceptorConfig;
  onUnauthorized?: () => void | Promise<void>;
}

/**
 * Re-export ApiError for convenience
 */
export type { ApiError } from './errors';

