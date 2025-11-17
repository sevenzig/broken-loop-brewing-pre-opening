// API Response interface
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// API Client interface
export interface ApiClient {
  get<T = any>(url: string): Promise<ApiResponse<T>>;
  post<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  put<T = any>(url: string, data?: any): Promise<ApiResponse<T>>;
  delete<T = any>(url: string): Promise<ApiResponse<T>>;
}

// Production API client
export class ProductionApiClient implements ApiClient {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url);
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        const text = await response.text();
        console.error(`API error (${response.status}):`, text);
        return {
          success: false,
          message: `API Error: ${response.status} - ${text || response.statusText}`,
        };
      }

      if (!isJson) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          message: 'API returned non-JSON response',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        data: responseData,
        message: !response.ok ? responseData.message || response.statusText : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        data: responseData,
        message: !response.ok ? responseData.message || response.statusText : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(url, {
        method: 'DELETE',
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        data: responseData,
        message: !response.ok ? responseData.message || response.statusText : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }
}

// Development API client - makes real API calls to local Vercel dev server
export class DevelopmentApiClient implements ApiClient {
  private baseUrl = 'http://localhost:3001';

  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const response = await fetch(fullUrl);
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        const text = await response.text();
        console.error(`API error (${response.status}):`, text);
        return {
          success: false,
          message: `API Error: ${response.status} - ${text || response.statusText}`,
        };
      }

      if (!isJson) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          message: 'API returned non-JSON response',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!isJson) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          message: 'API returned non-JSON response',
        };
      }

      const responseData = await response.json();
      return {
        success: response.ok,
        data: responseData,
        message: !response.ok ? responseData.message || response.statusText : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }

  async put<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const response = await fetch(fullUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!isJson) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          message: 'API returned non-JSON response',
        };
      }

      const responseData = await response.json();
      return {
        success: response.ok,
        data: responseData,
        message: !response.ok ? responseData.message || response.statusText : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`;
      const response = await fetch(fullUrl, {
        method: 'DELETE',
      });

      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!isJson) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          message: 'API returned non-JSON response',
        };
      }

      const responseData = await response.json();
      return {
        success: response.ok,
        data: responseData,
        message: !response.ok ? responseData.message || response.statusText : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }
}

// More reliable environment detection
const isDevelopment = () => {
  // Check if we're actually on localhost
  if (typeof window === 'undefined') {
    return false; // Server-side, assume production
  }
  
  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || 
                     hostname === '127.0.0.1' ||
                     hostname.includes('localhost') ||
                     hostname.includes('192.168.') ||
                     hostname.includes('10.0.');
  
  // Only use development client if we're actually on localhost
  return isLocalhost;
};

// Export the appropriate client based on environment
export const apiClient = isDevelopment() 
  ? new DevelopmentApiClient()
  : new ProductionApiClient();