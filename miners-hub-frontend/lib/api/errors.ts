/**
 * Error Handling Utilities
 * 
 * Centralized error handling and user-friendly error messages.
 */

export interface ApiError {
  message: string;
  status: number;
  errors?: Record<string, string[]>;
}

/**
 * Create a user-friendly error message from an API error
 */
export function getUserFriendlyMessage(error: ApiError | Error | unknown): string {
  if (error && typeof error === 'object' && 'status' in error) {
    const apiError = error as ApiError;
    
    // Handle specific status codes
    switch (apiError.status) {
      case 0:
        return 'Network error. Please check your internet connection.';
      case 400:
        return apiError.message || 'Invalid request. Please check your input.';
      case 401:
        return apiError.message && !['Unauthorized', 'An error occurred'].includes(apiError.message) 
          ? apiError.message 
          : 'Your session has expired. Please log in again.';
      case 403:
        return apiError.message && !['Forbidden resource', 'An error occurred'].includes(apiError.message) 
          ? apiError.message 
          : 'You do not have permission to perform this action.';
      case 404:
        return apiError.message && !['Not Found', 'An error occurred'].includes(apiError.message) 
          ? apiError.message 
          : 'The requested resource was not found.';
      case 408:
        return 'Request timeout. Please try again.';
      case 409:
        return apiError.message && !['Conflict', 'An error occurred'].includes(apiError.message) 
          ? apiError.message 
          : 'A conflict occurred. Please refresh and try again.';
      case 422:
        return apiError.message || 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please wait a moment and try again.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
      case 503:
      case 504:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return apiError.message || 'An unexpected error occurred.';
    }
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred.';
}

/**
 * Check if error is an API error
 */
export function isApiError(error: unknown): error is ApiError {
  return (
    error !== null &&
    typeof error === 'object' &&
    'status' in error &&
    'message' in error
  );
}

/**
 * Create an API error from a response
 */
export async function createApiErrorFromResponse(
  response: Response,
): Promise<ApiError> {
  let errorData: unknown;
  try {
    errorData = await response.json();
  } catch {
    errorData = { message: response.statusText };
  }

  const isErrorObject = (data: unknown): data is { message?: string; errors?: Record<string, string[]> } => {
    return typeof data === 'object' && data !== null;
  };

  let extractedMessage = 'An error occurred';
  if (isErrorObject(errorData) && errorData.message) {
    if (Array.isArray(errorData.message)) {
      extractedMessage = errorData.message[0]; // Or join with ', '
    } else if (typeof errorData.message === 'string') {
      extractedMessage = errorData.message;
    }
  }

  return {
    message: extractedMessage,
    status: response.status,
    errors: (isErrorObject(errorData) && errorData.errors) || undefined,
  };
}

/**
 * Create an API error from a network error
 */
export function createNetworkError(message: string = 'Network error'): ApiError {
  return {
    message,
    status: 0,
  };
}

/**
 * Create an API error from a timeout
 */
export function createTimeoutError(): ApiError {
  return {
    message: 'Request timeout',
    status: 408,
  };
}

