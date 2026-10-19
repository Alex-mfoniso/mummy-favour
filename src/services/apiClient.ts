/**
 * Centralized HTTP API Client for Divine Favour Frontend
 * Supports cookie-backed session credentials, CSRF synchronizer tokens, and typed responses.
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    timestamp?: string;
  };
  error?: {
    code: string;
    message: string;
    details?: any;
  };
}

export class ApiClientError extends Error {
  public code: string;
  public status: number;
  public details?: any;

  constructor(message: string, code: string = 'API_ERROR', status: number = 500, details?: any) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

class ApiClient {
  private baseUrl: string;
  private csrfToken: string | null = null;
  private onUnauthorizedCallbacks: Array<() => void> = [];

  constructor() {
    // Read from Vite environment variable or fall back to same-origin relative path in production
    const defaultUrl = import.meta.env.PROD ? '/api/v1' : 'http://localhost:5000/api/v1';
    const rawUrl = (import.meta.env.VITE_API_BASE_URL as string | undefined) || defaultUrl;
    this.baseUrl = rawUrl.replace(/\/+$/, '');
  }

  public getBaseUrl(): string {
    return this.baseUrl;
  }

  public setCsrfToken(token: string | null): void {
    this.csrfToken = token;
  }

  public getCsrfToken(): string | null {
    return this.csrfToken;
  }

  public onUnauthorized(callback: () => void): () => void {
    this.onUnauthorizedCallbacks.push(callback);
    return () => {
      this.onUnauthorizedCallbacks = this.onUnauthorizedCallbacks.filter((cb) => cb !== callback);
    };
  }

  private triggerUnauthorized(): void {
    this.csrfToken = null;
    this.onUnauthorizedCallbacks.forEach((cb) => cb());
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    const url = `${this.baseUrl}${cleanEndpoint}`;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Attach CSRF synchronizer token for state-changing requests
    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method) && this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken;
    }

    let response: Response;
    try {
      response = await fetch(url, {
        ...options,
        credentials: 'include', // Ensures HTTP-only session cookies are sent and received
        headers,
      });
    } catch (networkErr) {
      console.error('[ApiClient Network Error]', networkErr);
      throw new ApiClientError(
        'Unable to communicate with the Divine Favour backend server. Please verify the backend service is running.',
        'NETWORK_ERROR',
        0
      );
    }

    let payload: any;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        payload = await response.json();
      } catch {
        payload = null;
      }
    } else {
      payload = await response.text();
    }

    // Automatically synchronize CSRF token if returned in response data
    if (payload?.data?.csrfToken && typeof payload.data.csrfToken === 'string') {
      this.setCsrfToken(payload.data.csrfToken);
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.triggerUnauthorized();
      }

      const errorCode = payload?.error?.code || `HTTP_${response.status}`;
      const errorMessage =
        payload?.error?.message ||
        (typeof payload === 'string' ? payload : `Request failed with status ${response.status}`);
      const details = payload?.error?.details;

      throw new ApiClientError(errorMessage, errorCode, response.status, details);
    }

    return payload as ApiResponse<T>;
  }

  public async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
