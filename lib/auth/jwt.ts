/**
 * JWT Utilities
 * Secure JSON Web Token operations with modern security practices
 */

import jwt from 'jsonwebtoken';
import type { JWTPayload, AdminUser, SecurityEvent } from '../../src/types/auth';
import { JWT_CONFIG } from './config';

// Get JWT secret from environment variables
const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters long');
  }
  return secret;
};

/**
 * Generate a secure session ID
 */
export const generateSessionId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
};

/**
 * Sign a JWT token with admin user data
 */
export const signToken = (user: AdminUser): string => {
  const sessionId = generateSessionId();
  const now = Math.floor(Date.now() / 1000);
  
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
    permissions: user.permissions,
    iat: now,
    exp: now + (4 * 60 * 60), // 4 hours
    sessionId,
  };

  return jwt.sign(payload, getJWTSecret(), {
    algorithm: JWT_CONFIG.algorithm,
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  });
};

/**
 * Verify and decode a JWT token
 */
export const verifyToken = (token: string): JWTPayload | null => {
  try {
    const decoded = jwt.verify(token, getJWTSecret(), {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      clockTolerance: JWT_CONFIG.clockTolerance,
    }) as JWTPayload;

    // Check if token is expired (additional check)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
};

/**
 * Refresh a JWT token (sliding expiry)
 */
export const refreshToken = (currentToken: string): string | null => {
  const payload = verifyToken(currentToken);
  if (!payload) {
    return null;
  }

  // Check if token is still valid and not too close to expiry
  const now = Math.floor(Date.now() / 1000);
  const timeUntilExpiry = payload.exp - now;
  
  // Only refresh if token expires within 1 hour
  if (timeUntilExpiry > 60 * 60) {
    return currentToken; // No need to refresh yet
  }

  // Create new token with same user data but extended expiry
  const user: AdminUser = {
    id: payload.userId,
    username: payload.username,
    role: payload.role,
    permissions: payload.permissions,
  };

  return signToken(user);
};

/**
 * Extract token from Authorization header
 */
export const extractTokenFromHeader = (authHeader: string | undefined): string | null => {
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
};

/**
 * Create security event for logging
 */
export const createSecurityEvent = (
  type: SecurityEvent['type'],
  request: { ip?: string; userAgent?: string },
  details?: Record<string, unknown>
): SecurityEvent => {
  return {
    type,
    ip: request.ip || 'unknown',
    userAgent: request.userAgent || 'unknown',
    timestamp: Date.now(),
    details,
  };
};

/**
 * Log security events (in production, send to monitoring service)
 */
export const logSecurityEvent = (event: SecurityEvent): void => {
  // In development/demo, log to console
  console.log(`[SECURITY] ${event.type}:`, {
    timestamp: new Date(event.timestamp).toISOString(),
    ip: event.ip,
    userAgent: event.userAgent,
    details: event.details,
  });

  // In production, you would send this to a monitoring service
  // Example: Sentry, DataDog, CloudWatch, etc.
  if (process.env.NODE_ENV === 'production') {
    // TODO: Integrate with your monitoring service
    // monitoringService.logSecurityEvent(event);
  }
};

/**
 * Validate JWT token structure and claims
 */
export const validateTokenStructure = (payload: any): payload is JWTPayload => {
  return (
    typeof payload === 'object' &&
    payload !== null &&
    typeof payload.userId === 'string' &&
    typeof payload.username === 'string' &&
    payload.role === 'admin' &&
    Array.isArray(payload.permissions) &&
    typeof payload.iat === 'number' &&
    typeof payload.exp === 'number' &&
    typeof payload.sessionId === 'string'
  );
};

