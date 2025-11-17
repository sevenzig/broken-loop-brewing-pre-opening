/**
 * Rate Limiting System
 * Protects against brute force attacks with IP-based rate limiting
 */

import type { RateLimitState } from '../../src/types/auth';
import { RATE_LIMIT_CONFIG } from './config';
import { createSecurityEvent, logSecurityEvent } from './jwt';

// In-memory store for rate limiting (in production, use Redis or similar)
const rateLimitStore = new Map<string, RateLimitState>();

/**
 * Get client IP address from request headers
 */
export const getClientIP = (req: any): string => {
  // Check various headers for the real IP
  const xForwardedFor = req.headers['x-forwarded-for'];
  const xRealIP = req.headers['x-real-ip'];
  const xClientIP = req.headers['x-client-ip'];
  const cfConnectingIP = req.headers['cf-connecting-ip']; // Cloudflare
  const xVercelForwardedFor = req.headers['x-vercel-forwarded-for']; // Vercel
  
  if (xVercelForwardedFor && typeof xVercelForwardedFor === 'string') {
    return xVercelForwardedFor.split(',')[0].trim();
  }
  
  if (cfConnectingIP && typeof cfConnectingIP === 'string') {
    return cfConnectingIP;
  }
  
  if (xForwardedFor && typeof xForwardedFor === 'string') {
    return xForwardedFor.split(',')[0].trim();
  }
  
  if (xRealIP && typeof xRealIP === 'string') {
    return xRealIP;
  }
  
  if (xClientIP && typeof xClientIP === 'string') {
    return xClientIP;
  }
  
  // Fallback to connection remote address
  return req.connection?.remoteAddress || 
         req.socket?.remoteAddress || 
         req.ip || 
         'unknown';
};

/**
 * Get user agent from request headers
 */
export const getUserAgent = (req: any): string => {
  return req.headers['user-agent'] || 'unknown';
};

/**
 * Check if IP is rate limited
 */
export const isRateLimited = (ip: string): { limited: boolean; attemptsRemaining: number; lockedUntil: number | null } => {
  const now = Date.now();
  const state = rateLimitStore.get(ip);
  
  if (!state) {
    return { limited: false, attemptsRemaining: RATE_LIMIT_CONFIG.maxAttempts, lockedUntil: null };
  }
  
  // Check if lockout period has expired
  if (state.lockedUntil && now > state.lockedUntil) {
    rateLimitStore.delete(ip);
    return { limited: false, attemptsRemaining: RATE_LIMIT_CONFIG.maxAttempts, lockedUntil: null };
  }
  
  // Check if we're in lockout period
  if (state.lockedUntil && now <= state.lockedUntil) {
    return { limited: true, attemptsRemaining: 0, lockedUntil: state.lockedUntil };
  }
  
  // Check if rate limit window has expired
  if (now - state.firstAttempt > RATE_LIMIT_CONFIG.windowMs) {
    rateLimitStore.delete(ip);
    return { limited: false, attemptsRemaining: RATE_LIMIT_CONFIG.maxAttempts, lockedUntil: null };
  }
  
  const attemptsRemaining = RATE_LIMIT_CONFIG.maxAttempts - state.attempts;
  return { 
    limited: attemptsRemaining <= 0, 
    attemptsRemaining: Math.max(0, attemptsRemaining),
    lockedUntil: state.lockedUntil 
  };
};

/**
 * Record a failed login attempt
 */
export const recordFailedAttempt = (ip: string, userAgent: string, username?: string): void => {
  const now = Date.now();
  const state = rateLimitStore.get(ip) || {
    attempts: 0,
    firstAttempt: now,
    lockedUntil: null,
  };
  
  state.attempts += 1;
  
  // If this is the first attempt, record the timestamp
  if (state.attempts === 1) {
    state.firstAttempt = now;
  }
  
  // If we've reached the max attempts, lock the account
  if (state.attempts >= RATE_LIMIT_CONFIG.maxAttempts) {
    state.lockedUntil = now + (15 * 60 * 1000); // 15 minutes lockout
    
    // Log security event for account lockout
    const securityEvent = createSecurityEvent(
      'ACCOUNT_LOCKED',
      { ip, userAgent },
      { 
        username,
        attempts: state.attempts,
        lockoutDuration: 15 * 60 * 1000,
        lockedUntil: state.lockedUntil 
      }
    );
    logSecurityEvent(securityEvent);
  }
  
  rateLimitStore.set(ip, state);
  
  // Log failed login attempt
  const securityEvent = createSecurityEvent(
    'LOGIN_FAILURE',
    { ip, userAgent },
    { 
      username,
      attempts: state.attempts,
      attemptsRemaining: Math.max(0, RATE_LIMIT_CONFIG.maxAttempts - state.attempts)
    }
  );
  logSecurityEvent(securityEvent);
};

/**
 * Record a successful login attempt (clears rate limiting)
 */
export const recordSuccessfulAttempt = (ip: string, userAgent: string, username: string): void => {
  // Clear rate limiting for this IP
  rateLimitStore.delete(ip);
  
  // Log successful login
  const securityEvent = createSecurityEvent(
    'LOGIN_SUCCESS',
    { ip, userAgent },
    { username }
  );
  logSecurityEvent(securityEvent);
};

/**
 * Clean up expired rate limit entries (call periodically)
 */
export const cleanupExpiredEntries = (): void => {
  const now = Date.now();
  
  for (const [ip, state] of rateLimitStore.entries()) {
    const windowExpired = now - state.firstAttempt > RATE_LIMIT_CONFIG.windowMs;
    const lockoutExpired = state.lockedUntil && now > state.lockedUntil;
    
    if (windowExpired || lockoutExpired) {
      rateLimitStore.delete(ip);
    }
  }
};

/**
 * Get current rate limit stats for monitoring
 */
export const getRateLimitStats = () => {
  const now = Date.now();
  const activeEntries = Array.from(rateLimitStore.entries()).filter(([_, state]) => {
    const windowActive = now - state.firstAttempt <= RATE_LIMIT_CONFIG.windowMs;
    const lockoutActive = state.lockedUntil && now <= state.lockedUntil;
    return windowActive || lockoutActive;
  });
  
  return {
    totalActiveIPs: activeEntries.length,
    lockedIPs: activeEntries.filter(([_, state]) => state.lockedUntil && now <= state.lockedUntil).length,
    totalAttempts: activeEntries.reduce((sum, [_, state]) => sum + state.attempts, 0),
  };
};

