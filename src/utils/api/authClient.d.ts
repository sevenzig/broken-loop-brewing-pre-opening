/**
 * Authenticated HTTP Client
 * HTTP client with automatic JWT token handling and session management
 */
import type { LoginResponse } from '../../types/auth';
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
export declare class AuthClient {
    private baseURL;
    private token;
    constructor(baseURL?: string);
    /**
     * Load token from sessionStorage
     */
    private loadToken;
    /**
     * Set authentication token
     */
    setToken(token: string | null): void;
    /**
     * Get current token
     */
    getToken(): string | null;
    /**
     * Make authenticated request
     */
    private request;
    /**
     * Login with credentials
     */
    login(username: string, password: string): Promise<LoginResponse>;
    /**
     * Logout and clear token
     */
    logout(): Promise<void>;
    /**
     * Refresh token
     */
    refreshToken(): Promise<boolean>;
    /**
     * GET request
     */
    get<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>>;
    /**
     * POST request
     */
    post<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>>;
    /**
     * PUT request
     */
    put<T = any>(endpoint: string, body?: any, headers?: Record<string, string>): Promise<ApiResponse<T>>;
    /**
     * DELETE request
     */
    delete<T = any>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>>;
    /**
     * Upload file with authentication
     */
    uploadFile(file: File, endpoint?: string): Promise<ApiResponse>;
}
export declare const authClient: AuthClient;
export {};
