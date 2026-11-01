import { env } from '../../config/env';
import { APP_CONFIG } from '../../config';
import { ApiResponse, RequestOptions } from '../../types/api';
import { secureStorage } from '../storage/secureStorage';
import { ApiError } from '../../utils/errors';

export class ApiClient {
  private baseUrl: string;
  private defaultTimeout: number;

  constructor(
    baseUrl: string = env.apiBaseUrl,
    defaultTimeout: number = env.apiTimeoutMs
  ) {
    this.baseUrl = (baseUrl || '').replace(/\/+$/, '');
    this.defaultTimeout = defaultTimeout;
  }

  /**
   * Builds the query string from an object safely
   */
  private buildQueryString(
    params?: Record<string, string | number | boolean | undefined>
  ): string {
    if (!params) return '';
    const query = Object.entries(params)
      .filter(([_, value]) => value !== undefined && value !== null)
      .map(
        ([key, value]) =>
          `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      )
      .join('&');
    return query ? `?${query}` : '';
  }

  /**
   * Generic typed request execution with timeout, authentication, and structured error handling
   */
  async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      params,
      body,
      timeout = this.defaultTimeout,
      requiresAuth = true,
    } = options;

    if (!this.baseUrl && !env.useMockApi) {
      throw new ApiError(
        'API Base URL is not configured. Please set EXPO_PUBLIC_API_BASE_URL or run in Mock Mode.',
        0,
        'CONFIG_ERROR',
        undefined,
        'NETWORK_UNAVAILABLE'
      );
    }

    const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${normalizedEndpoint}${this.buildQueryString(params)}`;

    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...headers,
    };

    if (requiresAuth) {
      const token = await secureStorage.getItem(APP_CONFIG.storageKeys.authToken);
      if (token) {
        requestHeaders.Authorization = `Bearer ${token}`;
      }
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        method,
        headers: requestHeaders,
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Safe JSON parsing that accommodates empty responses (e.g. 204 No Content)
      const contentType = response.headers.get('content-type') || '';
      const isJson = contentType.includes('application/json');

      let responseData: any = null;
      if (isJson) {
        try {
          responseData = await response.json();
        } catch {
          responseData = null;
        }
      } else {
        const textData = await response.text();
        responseData = textData ? { message: textData } : null;
      }

      if (!response.ok) {
        const errorMessage =
          responseData?.message ||
          responseData?.error ||
          `Request failed with status ${response.status}`;

        throw new ApiError(
          errorMessage,
          response.status,
          responseData?.code,
          responseData?.details
        );
      }

      // Handle un-enveloped backend responses gracefully:
      // If backend sends raw T instead of ApiResponse<T>, wrap it transparently
      if (
        responseData !== null &&
        typeof responseData === 'object' &&
        'data' in responseData &&
        'success' in responseData
      ) {
        return responseData as ApiResponse<T>;
      }

      return {
        success: true,
        data: responseData as T,
      };
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new ApiError(
          'Request timed out. Please check your internet connection.',
          408,
          'TIMEOUT',
          undefined,
          'TIMEOUT'
        );
      }

      throw new ApiError(
        error instanceof Error ? error.message : 'Network request failed',
        0,
        'NETWORK_ERROR',
        undefined,
        'NETWORK_UNAVAILABLE'
      );
    }
  }

  get<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  }

  post<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'POST', body });
  }

  put<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'PUT', body });
  }

  patch<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) {
    return this.request<T>(endpoint, { ...options, method: 'PATCH', body });
  }

  delete<T>(endpoint: string, options?: Omit<RequestOptions, 'method' | 'body'>) {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
