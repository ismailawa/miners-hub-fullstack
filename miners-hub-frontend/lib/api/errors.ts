/**
 * Error handling utilities for API client
 */

import { ApiError } from "./types";

/**
 * Create a user-friendly error message from API error
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;
    if (apiError.message) {
      return apiError.message;
    }
  }

  return "An unexpected error occurred";
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "AbortError" || error.message.includes("network");
  }
  return false;
}

/**
 * Check if error is a timeout error
 */
export function isTimeoutError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.name === "AbortError";
  }
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;
    return apiError.status === 408;
  }
  return false;
}

/**
 * Check if error is an authentication error
 */
export function isAuthError(error: unknown): boolean {
  if (typeof error === "object" && error !== null) {
    const apiError = error as ApiError;
    return apiError.status === 401 || apiError.status === 403;
  }
  return false;
}

/**
 * Create standardized API error
 */
export function createApiError(
  message: string,
  status: number,
  errors?: Record<string, string[]>
): ApiError {
  return {
    message,
    status,
    errors,
  };
}

