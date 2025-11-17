/**
 * Authenticated HTTP Client
 * HTTP client with automatic JWT token handling and session management
 */

import type { LoginResponse } from '../../types/auth';

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  code?: string;
  timestamp?: number;
}

/**
 * Authenticated API Client Class
 */
export class AuthClient {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL?: string) {
    // Use the same environment detection as apiClient
    const isDevelopment = () => {
      if (typeof window === 'undefined') {
        return false; // Server-side, assume production
      }
      
      const hostname = window.location.hostname;
      const isLocalhost = hostname === 'localhost' || 
                         hostname === '127.0.0.1' ||
                         hostname.includes('localhost') ||
                         hostname.includes('192.168.') ||
                         hostname.includes('10.0.');
      
      return isLocalhost;
    };

    // Set base URL based on environment
    if (baseURL) {
      this.baseURL = baseURL;
    } else if (isDevelopment()) {
      this.baseURL = 'http://localhost:3001/api';
    } else {
      this.baseURL = '/api';
    }
    
    this.loadToken();
  }

  /**
   * Load token from sessionStorage
   */
  private loadToken(): void {
    if (typeof window !== 'undefined') {
      this.token = sessionStorage.getItem('auth-token');
    }
  }

  /**
   * Set authentication token
   */
  public setToken(token: string | null): void {
    this.token = token;
    
    if (typeof window !== 'undefined') {
      if (token) {
        sessionStorage.setItem('auth-token', token);
      } else {
        sessionStorage.removeItem('auth-token');
      }
    }
  }

  /**
   * Get current token
   */
  public getToken(): string | null {
    return this.token;
  }

  /**
   * Make authenticated request
   */
  private async request<T = any>(
    endpoint: string, 
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const { method = 'GET', headers = {}, body } = options;
    
    const url = `${this.baseURL}${endpoint}`;
    
    const requestHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...headers,
    };

    // Add authorization header if token exists
    if (this.token) {
      requestHeaders['Authorization'] = `Bearer ${this.token}`;
    }

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
    };

    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    try {
      const response = await fetch(url, requestOptions);
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');
      
      let data;
      if (isJson) {
        data = await response.json();
      } else {
        // If not JSON, read as text to see what we got
        const text = await response.text();
        console.error('Non-JSON response received:', text);
        throw new Error(`Expected JSON response but got ${contentType || 'unknown content type'}`);
      }

      if (response.status === 401) {
        // Token expired or invalid, clear local token
        this.setToken(null);
        
        return {
          success: false,
          error: data.error || 'Authentication required',
          code: data.code || 'UNAUTHORIZED',
          timestamp: Date.now(),
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          code: data.code || 'HTTP_ERROR',
          timestamp: data.timestamp || Date.now(),
        };
      }

      return {
        success: true,
        data,
        timestamp: data.timestamp || Date.now(),
      };
    } catch (error) {
      console.error('API request failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
        code: 'NETWORK_ERROR',
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Login with credentials
   */
  public async login(username: string, password: string): Promise<LoginResponse> {
    try {
      const response = await fetch(`${this.baseURL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token) {
        this.setToken(data.token);
      }

      return data;
    } catch (error) {
      console.error('Login request failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error occurred',
      };
    }
  }

  /**
   * Logout and clear token
   */
  public async logout(): Promise<void> {
    try {
      if (this.token) {
        await fetch(`${this.baseURL}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout request failed:', error);
    } finally {
      this.setToken(null);
    }
  }

  /**
   * Refresh token
   */
  public async refreshToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseURL}/auth/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.token) {
        this.setToken(data.token);
        return true;
      } else {
        this.setToken(null);
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.setToken(null);
      return false;
    }
  }

  /**
   * GET request
   */
  public async get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET', headers });
  }

  /**
   * POST request
   */
  public async post<T = any>(
    endpoint: string, 
    body?: any, 
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'POST', body, headers });
  }

  /**
   * PUT request
   */
  public async put<T = any>(
    endpoint: string, 
    body?: any, 
    headers?: Record<string, string>
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'PUT', body, headers });
  }

  /**
   * DELETE request
   */
  public async delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE', headers });
  }

  /**
   * Upload file with authentication
   */
  public async uploadFile(file: File, endpoint: string = '/upload'): Promise<ApiResponse> {
    if (!this.token) {
      return {
        success: false,
        error: 'Authentication required',
        code: 'UNAUTHORIZED',
        timestamp: Date.now(),
      };
    }

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.status === 401) {
        this.setToken(null);
        return {
          success: false,
          error: 'Authentication required',
          code: 'UNAUTHORIZED',
          timestamp: Date.now(),
        };
      }

      if (!response.ok) {
        return {
          success: false,
          error: data.error || `HTTP ${response.status}`,
          code: data.code || 'HTTP_ERROR',
          timestamp: Date.now(),
        };
      }

      return {
        success: true,
        data,
        timestamp: Date.now(),
      };
    } catch (error) {
      console.error('File upload failed:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
        code: 'UPLOAD_ERROR',
        timestamp: Date.now(),
      };
    }
  }
}

// Global authenticated client instance
export const authClient = new AuthClient();

