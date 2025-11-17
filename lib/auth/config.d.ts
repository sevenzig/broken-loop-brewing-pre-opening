/**
 * Authentication Configuration
 * Secure admin credentials and authentication settings
 */
import type { AdminUser, AuthConfig } from '../../src/types/auth';
export declare const ADMIN_USER: Omit<AdminUser, 'lastLogin' | 'loginAttempts' | 'lockedUntil'>;
export declare const ADMIN_PASSWORD_HASH = "$2b$12$e3FiPlvGJ4ZZOit3XhXjTudFfrBgJe8QJ0USvwNeBUbYDQbG1YySq";
export declare const AUTH_CONFIG: Omit<AuthConfig, 'jwtSecret'>;
export declare const RATE_LIMIT_CONFIG: {
    windowMs: number;
    maxAttempts: number;
    skipSuccessfulRequests: boolean;
    skipFailedRequests: boolean;
    standardHeaders: boolean;
    legacyHeaders: boolean;
};
export declare const SECURITY_HEADERS: {
    readonly 'X-Frame-Options': "DENY";
    readonly 'X-Content-Type-Options': "nosniff";
    readonly 'X-XSS-Protection': "1; mode=block";
    readonly 'Referrer-Policy': "strict-origin-when-cross-origin";
    readonly 'Permissions-Policy': "geolocation=(), microphone=(), camera=()";
    readonly 'Strict-Transport-Security': "max-age=31536000; includeSubDomains";
};
export declare const JWT_CONFIG: {
    algorithm: "HS256";
    issuer: string;
    audience: string;
    expiresIn: string;
    notBefore: string;
    clockTolerance: number;
};
export declare const SESSION_CONFIG: {
    name: string;
    maxAge: number;
    secure: boolean;
    httpOnly: boolean;
    sameSite: "strict";
};
