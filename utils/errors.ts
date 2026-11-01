/**
 * Custom API, Network, and Application Error Handling
 * Standardized across both Mock and Backend API integration modes.
 */

export type ApiErrorKind =
  | 'NETWORK_UNAVAILABLE'
  | 'TIMEOUT'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_FAILED'
  | 'RATE_LIMITED'
  | 'SERVER_ERROR'
  | 'INVALID_RESPONSE'
  | 'UNKNOWN';

export class ApiError extends Error {
  public statusCode?: number;
  public code?: string;
  public kind: ApiErrorKind;
  public details?: Record<string, string | string[]> | string[];

  constructor(
    message: string,
    statusCode?: number,
    code?: string,
    details?: Record<string, string | string[]> | string[],
    kind?: ApiErrorKind
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.kind = kind || ApiError.categorizeKind(statusCode, code);
  }

  /**
   * Automatically categorize error kind from HTTP status and error codes
   */
  public static categorizeKind(statusCode?: number, code?: string): ApiErrorKind {
    if (!statusCode || statusCode === 0) {
      if (code === 'TIMEOUT' || code === 'ECONNABORTED') return 'TIMEOUT';
      return 'NETWORK_UNAVAILABLE';
    }
    if (statusCode === 401) return 'UNAUTHORIZED';
    if (statusCode === 403) return 'FORBIDDEN';
    if (statusCode === 404) return 'NOT_FOUND';
    if (statusCode === 408) return 'TIMEOUT';
    if (statusCode === 422 || statusCode === 400) return 'VALIDATION_FAILED';
    if (statusCode === 429) return 'RATE_LIMITED';
    if (statusCode >= 500) return 'SERVER_ERROR';
    return 'UNKNOWN';
  }
}

/**
 * Extracts a human-friendly, safe error message suitable for UI presentation
 */
export const getErrorMessage = (
  error: unknown,
  fallbackMessage = 'An unexpected error occurred. Please try again.'
): string => {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'NETWORK_UNAVAILABLE':
        return 'Network connection is unavailable. Please check your internet connection.';
      case 'TIMEOUT':
        return 'The request took too long to respond. Please check your network and try again.';
      case 'UNAUTHORIZED':
        return 'Your session has expired or is invalid. Please log in again.';
      case 'FORBIDDEN':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND':
        return error.message || 'The requested resource was not found.';
      case 'VALIDATION_FAILED':
        return error.message || 'Please verify the entered information and try again.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait a few moments before trying again.';
      case 'SERVER_ERROR':
        return 'Our servers encountered an unexpected issue. Our team has been notified.';
      case 'INVALID_RESPONSE':
        return 'Received an unexpected response from the server.';
      default:
        return error.message || fallbackMessage;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return fallbackMessage;
};
