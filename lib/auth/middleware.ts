/**
 * Authentication Middleware
 * JWT-based authentication middleware for API route protection
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import type { JWTPayload, AdminPermission, SecurityEvent } from '../../src/types/auth';
import { verifyToken, extractTokenFromHeader, createSecurityEvent, logSecurityEvent } from './jwt';
import { getClientIP, getUserAgent } from './rateLimiter';
import { SECURITY_HEADERS } from './config';

export interface AuthenticatedRequest extends VercelRequest {
  user: JWTPayload;
}

/**
 * Apply security headers to response
 */
export const applySecurityHeaders = (res: VercelResponse): void => {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    res.setHeader(header, value);
  });
};

/**
 * Authentication middleware for API routes
 */
export const requireAuth = (
  handler: (req: AuthenticatedRequest, res: VercelResponse) => Promise<void> | void,
  requiredPermissions: AdminPermission[] = []
) => {
  return async (req: VercelRequest, res: VercelResponse) => {
    try {
      // Apply security headers
      applySecurityHeaders(res);
      
      // Set CORS headers (restrict in production)
      const allowedOrigins = process.env.NODE_ENV === 'production' 
        ? ['https://brokenloopbrewing.com', 'https://www.brokenloopbrewing.com']
        : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'];
      
      const origin = req.headers.origin;
      if (origin && allowedOrigins.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
      }
      
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      res.setHeader('Access-Control-Allow-Credentials', 'true');

      // Handle preflight requests
      if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
      }

      // Extract and verify JWT token
      const authHeader = req.headers.authorization;
      const token = extractTokenFromHeader(authHeader);
      
      if (!token) {
        // Log unauthorized access attempt
        const securityEvent = createSecurityEvent(
          'UNAUTHORIZED_ACCESS',
          { 
            ip: getClientIP(req), 
            userAgent: getUserAgent(req) 
          },
          { 
            endpoint: req.url,
            method: req.method,
            reason: 'Missing authorization header'
          }
        );
        logSecurityEvent(securityEvent);
        
        res.status(401).json({ 
          error: 'Authorization required',
          code: 'MISSING_TOKEN',
          timestamp: Date.now()
        });
        return;
      }

      const payload = verifyToken(token);
      if (!payload) {
        // Log invalid token attempt
        const securityEvent = createSecurityEvent(
          'UNAUTHORIZED_ACCESS',
          { 
            ip: getClientIP(req), 
            userAgent: getUserAgent(req) 
          },
          { 
            endpoint: req.url,
            method: req.method,
            reason: 'Invalid or expired token'
          }
        );
        logSecurityEvent(securityEvent);
        
        res.status(401).json({ 
          error: 'Invalid or expired token',
          code: 'INVALID_TOKEN',
          timestamp: Date.now()
        });
        return;
      }

      // Check required permissions
      if (requiredPermissions.length > 0) {
        const hasAllPermissions = requiredPermissions.every(permission => 
          payload.permissions.includes(permission)
        );
        
        if (!hasAllPermissions) {
          // Log insufficient permissions
          const securityEvent = createSecurityEvent(
            'UNAUTHORIZED_ACCESS',
            { 
              ip: getClientIP(req), 
              userAgent: getUserAgent(req) 
            },
            { 
              endpoint: req.url,
              method: req.method,
              userId: payload.userId,
              username: payload.username,
              requiredPermissions,
              userPermissions: payload.permissions,
              reason: 'Insufficient permissions'
            }
          );
          logSecurityEvent(securityEvent);
          
          res.status(403).json({ 
            error: 'Insufficient permissions',
            code: 'INSUFFICIENT_PERMISSIONS',
            required: requiredPermissions,
            timestamp: Date.now()
          });
          return;
        }
      }

      // Add user to request object
      (req as AuthenticatedRequest).user = payload;

      // Call the protected handler
      await handler(req as AuthenticatedRequest, res);
      
    } catch (error) {
      console.error('Authentication middleware error:', error);
      
      // Log internal error
      const securityEvent = createSecurityEvent(
        'UNAUTHORIZED_ACCESS',
        { 
          ip: getClientIP(req), 
          userAgent: getUserAgent(req) 
        },
        { 
          endpoint: req.url,
          method: req.method,
          error: error instanceof Error ? error.message : 'Unknown error',
          reason: 'Authentication middleware error'
        }
      );
      logSecurityEvent(securityEvent);
      
      res.status(500).json({ 
        error: 'Internal server error',
        code: 'AUTH_MIDDLEWARE_ERROR',
        timestamp: Date.now()
      });
    }
  };
};

/**
 * Permission check helper
 */
export const hasPermission = (user: JWTPayload, permission: AdminPermission): boolean => {
  return user.permissions.includes(permission);
};

/**
 * Multiple permission check helper
 */
export const hasAllPermissions = (user: JWTPayload, permissions: AdminPermission[]): boolean => {
  return permissions.every(permission => user.permissions.includes(permission));
};

/**
 * Any permission check helper
 */
export const hasAnyPermission = (user: JWTPayload, permissions: AdminPermission[]): boolean => {
  return permissions.some(permission => user.permissions.includes(permission));
};

/**
 * Admin role check helper
 */
export const isAdmin = (user: JWTPayload): boolean => {
  return user.role === 'admin' && user.permissions.includes('admin:access');
};

/**
 * Log user activity for security monitoring
 */
export const logUserActivity = (
  user: JWTPayload,
  action: string,
  request: { ip: string; userAgent: string },
  details?: Record<string, unknown>
): void => {
  const securityEvent: SecurityEvent = {
    type: 'LOGIN_SUCCESS', // Reusing this type for general activity
    userId: user.userId,
    username: user.username,
    ip: request.ip,
    userAgent: request.userAgent,
    timestamp: Date.now(),
    details: {
      action,
      sessionId: user.sessionId,
      ...details
    }
  };
  
  logSecurityEvent(securityEvent);
};

