/**
 * API Client Index
 * Central export point for all API services
 */

// Base client
export {
  apiRequest,
  get,
  post,
  put,
  patch,
  del,
  addRequestInterceptor,
  addResponseInterceptor,
  addErrorInterceptor,
  removeInterceptor,
} from "./client";

// Types
export type {
  ApiError,
  ApiRequestConfig,
  ApiResponse,
  RequestInterceptor,
  ResponseInterceptor,
  ErrorInterceptor,
} from "./types";

// Error utilities
export {
  getErrorMessage,
  isNetworkError,
  isTimeoutError,
  isAuthError,
  createApiError,
} from "./errors";

// Token utilities
export {
  getAccessToken,
  getRefreshToken,
  storeTokens,
  removeTokens,
} from "./token";

// Service modules
export * from "./auth";
export * from "./notifications";
export * from "./users";
export * from "./listings";
export * from "./auctions";
export * from "./contracts";
export * from "./orders";
export * from "./chats";
export * from "./documents";

// Re-export types from central types file
export * from "@/lib/types";

