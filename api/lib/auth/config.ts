/**
 * Authentication Configuration
 * Secure admin credentials and authentication settings
 */

import type { AdminUser, AuthConfig } from '../../types/auth';

// Hardcoded admin user - more secure than environment variables
// In production, consider using a secure credential store
export const ADMIN_USER: Omit<AdminUser, 'lastLogin' | 'loginAttempts' | 'lockedUntil'> = {
  id: 'admin-001',
  username: 'admin',
  role: 'admin',
  permissions: [
    'beer:create',
    'beer:read', 
    'beer:update',
    'beer:delete',
    'business:manage',
    'sync:github',
    'upload:files',
    'admin:access'
  ]
};

// Hardcoded admin password - hashed with salt
// Password: "BrewMaster2025!" (change this to your preferred password)
export const ADMIN_PASSWORD_HASH = '$2b$12$e3FiPlvGJ4ZZOit3XhXjTudFfrBgJe8QJ0USvwNeBUbYDQbG1YySq';

// Authentication configuration
export const AUTH_CONFIG: Omit<AuthConfig, 'jwtSecret'> = {
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes
  tokenExpiry: 4 * 60 * 60 * 1000, // 4 hours
  rateLimitWindow: 15 * 60 * 1000, // 15 minutes
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
  skipSuccessfulRequests: true,
  skipFailedRequests: false,
  standardHeaders: true,
  legacyHeaders: false,
};

// Security headers configuration
export const SECURITY_HEADERS = {
  'Content-Type': 'application/json',
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
} as const;

// JWT configuration
export const JWT_CONFIG = {
  algorithm: 'HS256' as const,
  issuer: 'broken-loop-brewing',
  audience: 'admin-panel',
  expiresIn: '4h',
  notBefore: '0s',
  clockTolerance: 30, // seconds
};

// Session configuration
export const SESSION_CONFIG = {
  name: 'blb-admin-session',
  maxAge: 4 * 60 * 60 * 1000, // 4 hours
  secure: process.env.NODE_ENV === 'production',
  httpOnly: false, // false because we're using localStorage for persistence
  sameSite: 'strict' as const,
};
