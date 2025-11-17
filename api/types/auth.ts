/**
 * Authentication Types and Interfaces
 * Comprehensive type definitions for JWT-based admin authentication
 */

export interface AdminUser {
  id: string;
  username: string;
  role: 'admin';
  permissions: AdminPermission[];
  lastLogin?: string;
  loginAttempts?: number;
  lockedUntil?: string;
}

export type AdminPermission = 
  | 'beer:create'
  | 'beer:read'
  | 'beer:update'
  | 'beer:delete'
  | 'business:manage'
  | 'sync:github'
  | 'upload:files'
  | 'admin:access';

export interface AuthState {
  isAuthenticated: boolean;
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  loginAttempts: number;
  lockedUntil: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: AdminUser;
  error?: string;
  lockedUntil?: string;
  attemptsRemaining?: number;
}

export interface JWTPayload {
  userId?: string;
  sub?: string; // Alternative to userId for some JWT libraries
  username: string;
  role: 'admin';
  permissions: AdminPermission[];
  iat: number;
  exp: number;
  sessionId?: string; // Optional for development tokens
  iss?: string; // Optional issuer field
}

export interface AuthError {
  type: 'INVALID_CREDENTIALS' | 'ACCOUNT_LOCKED' | 'TOKEN_EXPIRED' | 'UNAUTHORIZED' | 'RATE_LIMITED';
  message: string;
  code: string;
  timestamp: number;
  ip?: string;
  userAgent?: string;
  attemptsRemaining?: number;
  lockedUntil?: string;
}

export interface SecurityEvent {
  type: 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'LOGOUT' | 'TOKEN_REFRESH' | 'UNAUTHORIZED_ACCESS' | 'ACCOUNT_LOCKED';
  userId?: string;
  username?: string;
  ip: string;
  userAgent: string;
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface RateLimitState {
  attempts: number;
  firstAttempt: number;
  lockedUntil: number | null;
}

export interface AuthConfig {
  maxLoginAttempts: number;
  lockoutDuration: number; // in milliseconds
  tokenExpiry: number; // in milliseconds (4 hours)
  rateLimitWindow: number; // in milliseconds
  jwtSecret: string;
}

