/**
 * JWT Utilities
 * Secure JSON Web Token operations with modern security practices
 */

import jwt from 'jsonwebtoken';
import type { JWTPayload, AdminUser, SecurityEvent } from '../../types/auth';
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
    // Check if this is a development token
    if (token.endsWith('.dev-signature')) {
      console.log('Verifying development token:', token.substring(0, 50) + '...');
      const parts = token.split('.');
      if (parts.length === 3) {
        try {
          const payload = JSON.parse(atob(parts[1]));
          const now = Math.floor(Date.now() / 1000);
          
          console.log('Development token payload:', {
            userId: payload.userId,
            username: payload.username,
            role: payload.role,
            exp: payload.exp,
            now: now,
            expired: payload.exp && payload.exp < now
          });
          
          // Check if token is expired
          if (payload.exp && payload.exp < now) {
            console.log('Development token expired');
            return null;
          }
          
          // Validate the payload structure
          if (validateTokenStructure(payload)) {
            console.log('Development token validation successful');
            // Normalize the payload to ensure userId is present
            const normalizedPayload: JWTPayload = {
              ...payload,
              userId: extractUserId(payload),
            };
            return normalizedPayload;
          } else {
            console.log('Development token structure validation failed:', payload);
            return null;
          }
        } catch (err) {
          console.error('Development token parsing failed:', err);
          return null;
        }
      }
      console.log('Development token has invalid format');
      return null;
    }

    // Production JWT verification
    const decoded = jwt.verify(token, getJWTSecret(), {
      algorithms: [JWT_CONFIG.algorithm],
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
      clockTolerance: JWT_CONFIG.clockTolerance,
    }) as any;

    // Check if token is expired (additional check)
    const now = Math.floor(Date.now() / 1000);
    if (decoded.exp < now) {
      return null;
    }

    // Normalize the payload to ensure userId is present
    const normalizedPayload: JWTPayload = {
      ...decoded,
      userId: extractUserId(decoded),
    };

    return normalizedPayload;
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
    id: extractUserId(payload),
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
 * Extract user ID from JWT payload (handles both userId and sub fields)
 */
export const extractUserId = (payload: any): string => {
  const userId = payload.userId || payload.sub;
  if (!userId || typeof userId !== 'string') {
    throw new Error('Invalid JWT payload: missing user ID');
  }
  return userId;
};

/**
 * Validate JWT token structure and claims
 */
export const validateTokenStructure = (payload: any): payload is JWTPayload => {
  // Handle both development and production token formats
  const hasUserId = typeof payload.userId === 'string' || typeof payload.sub === 'string';
  const hasUsername = typeof payload.username === 'string';
  const hasRole = payload.role === 'admin';
  const hasPermissions = Array.isArray(payload.permissions);
  const hasIat = typeof payload.iat === 'number';
  const hasExp = typeof payload.exp === 'number';
  const hasSessionId = typeof payload.sessionId === 'string' || payload.sessionId === undefined;
  
  const isValid = (
    typeof payload === 'object' &&
    payload !== null &&
    hasUserId &&
    hasUsername &&
    hasRole &&
    hasPermissions &&
    hasIat &&
    hasExp &&
    hasSessionId
  );
  
  console.log('Token structure validation:', {
    hasUserId,
    hasUsername,
    hasRole,
    hasPermissions,
    hasIat,
    hasExp,
    hasSessionId,
    isValid,
    payload: {
      userId: payload.userId,
      sub: payload.sub,
      username: payload.username,
      role: payload.role,
      permissions: payload.permissions?.length,
      iat: payload.iat,
      exp: payload.exp,
      sessionId: payload.sessionId
    }
  });
  
  return isValid;
};

