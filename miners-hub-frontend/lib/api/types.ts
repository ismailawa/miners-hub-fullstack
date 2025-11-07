/**
 * Common types and interfaces for API client
 */

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface ApiRequestConfig extends RequestInit {
  timeout?: number;
  retryCount?: number;
  skipAuth?: boolean;
}

export type RequestInterceptor = (config: ApiRequestConfig) => ApiRequestConfig | Promise<ApiRequestConfig>;
export type ResponseInterceptor = <T>(data: T) => Promise<T> | T;
export type ErrorInterceptor = (error: ApiError) => Promise<never> | never;

