/**
 * Authentication Context
 * React context for managing admin authentication state and session management
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { AuthState, AdminUser, LoginCredentials, LoginResponse, AdminPermission } from '../types/auth';
import { ADMIN_USER, ADMIN_PASSWORD_HASH } from '../config/auth';
import bcrypt from 'bcryptjs';

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<boolean>;
  clearError: () => void;
  checkAuthStatus: () => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Authentication Provider Component
 * Manages authentication state and provides auth methods to children
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    token: null,
    loading: true,
    error: null,
    loginAttempts: 0,
    lockedUntil: null,
  });

  /**
   * Check if user is authenticated on app load
   */
  const checkAuthStatus = useCallback(() => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    try {
      const token = localStorage.getItem('auth-token');
      const userStr = localStorage.getItem('auth-user');
      
      console.log('Checking auth status:', {
        hasToken: !!token,
        hasUser: !!userStr,
        tokenType: token ? (token.endsWith('.dev-signature') ? 'development' : 'production') : 'none',
        hostname: window.location.hostname
      });
      
      if (token && userStr) {
        const user = JSON.parse(userStr) as AdminUser;
        
        // Verify token is still valid by checking expiry
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          try {
            const payload = JSON.parse(atob(tokenParts[1]));
            const now = Math.floor(Date.now() / 1000);
            
            // Check if token has expiration and is still valid
            // Handle both development tokens (.dev-signature) and production tokens
            const isDevToken = token.endsWith('.dev-signature');
            const isValidToken = isDevToken || (payload.exp && payload.exp > now);
            
            console.log('Token validation:', {
              isDevToken,
              exp: payload.exp,
              now,
              isValidToken,
              payload: { userId: payload.userId, username: payload.username, role: payload.role }
            });
            
            if (isValidToken) {
              setAuthState(prev => ({
                ...prev,
                isAuthenticated: true,
                user,
                token,
                loading: false,
                error: null,
              }));
              return;
            } else if (payload.exp && payload.exp <= now) {
              // Token has expired, clear it
              console.log('Token expired, clearing authentication');
              localStorage.removeItem('auth-token');
              localStorage.removeItem('auth-user');
            }
          } catch (err) {
            console.error('Error parsing token:', err);
            // Invalid token format, clear it
            localStorage.removeItem('auth-token');
            localStorage.removeItem('auth-user');
          }
        } else {
          // Invalid token format, clear it
          localStorage.removeItem('auth-token');
          localStorage.removeItem('auth-user');
        }
      }
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
      }));
      
    } catch (error) {
      console.error('Error checking auth status:', error);
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: 'Failed to check authentication status',
      }));
    }
  }, []);

  /**
   * Login function
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    setAuthState(prev => ({ 
      ...prev, 
      loading: true, 
      error: null,
      loginAttempts: prev.loginAttempts + 1 
    }));

    try {
      // Development mode: Check credentials locally if API is not available
      // Only use development mode when running on localhost
      const isLocalDevelopment = process.env.NODE_ENV === 'development' && 
        (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
      
      if (isLocalDevelopment) {
        // Check if this is the correct username/password
        if (credentials.username === ADMIN_USER.username && 
            await bcrypt.compare(credentials.password, ADMIN_PASSWORD_HASH)) {
          const adminUser: AdminUser = {
            ...ADMIN_USER,
            lastLogin: new Date().toISOString()
          };
          
          // For development, we'll use a simple token that the backend can recognize
          // The backend should handle development mode differently
          const now = Math.floor(Date.now() / 1000);
          const exp = now + (4 * 60 * 60); // 4 hours from now
          const payload = {
            userId: adminUser.id,
            username: adminUser.username,
            role: adminUser.role,
            permissions: adminUser.permissions,
            iat: now,
            exp: exp,
            sessionId: `dev-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
          };
          
          // Create a simple base64 encoded token for development
          const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
          const payloadB64 = btoa(JSON.stringify(payload));
          const devToken = `${header}.${payloadB64}.dev-signature`;
          
          // Store auth data in localStorage for persistent sessions
          localStorage.setItem('auth-token', devToken);
          localStorage.setItem('auth-user', JSON.stringify(adminUser));
          
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: true,
            user: adminUser,
            token: devToken,
            loading: false,
            error: null,
            loginAttempts: 0,
            lockedUntil: null,
          }));

          return {
            success: true,
            token: devToken,
            user: adminUser
          } as LoginResponse;
        } else {
          // Failed login - invalid credentials
          setAuthState(prev => ({
            ...prev,
            isAuthenticated: false,
            user: null,
            token: null,
            loading: false,
            error: 'Invalid credentials',
            lockedUntil: null,
          }));

          return {
            success: false,
            error: 'Invalid credentials',
            attemptsRemaining: 4
          };
        }
      }

      // Production mode: Use actual API
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.token && data.user) {
        // Store auth data in localStorage for persistent sessions
        localStorage.setItem('auth-token', data.token);
        localStorage.setItem('auth-user', JSON.stringify(data.user));
        
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: true,
          user: data.user!,
          token: data.token!,
          loading: false,
          error: null,
          loginAttempts: 0,
          lockedUntil: null,
        }));

        return data;
      } else {
        // Handle login failure
        setAuthState(prev => ({
          ...prev,
          isAuthenticated: false,
          user: null,
          token: null,
          loading: false,
          error: data.error || 'Login failed',
          lockedUntil: data.lockedUntil || null,
        }));

        return data;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Network error occurred';
      
      setAuthState(prev => ({
        ...prev,
        isAuthenticated: false,
        user: null,
        token: null,
        loading: false,
        error: errorMessage,
      }));

      return {
        success: false,
        error: errorMessage,
      };
    }
  }, []);

  /**
   * Logout function
   */
  const logout = useCallback(async (): Promise<void> => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const token = authState.token;
      
      // Call logout API to invalidate token
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local logout even if API fails
    }

    // Clear local storage and state
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
      loginAttempts: 0,
      lockedUntil: null,
    });
  }, [authState.token]);

  /**
   * Refresh token function (sliding expiry)
   */
  const refreshToken = useCallback(async (): Promise<boolean> => {
    if (!authState.token) {
      return false;
    }

    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success && data.token) {
        // Update token in storage and state
        localStorage.setItem('auth-token', data.token);
        
        setAuthState(prev => ({
          ...prev,
          token: data.token,
          error: null,
        }));

        return true;
      } else {
        // Token refresh failed, logout user
        await logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      await logout();
      return false;
    }
  }, [authState.token, logout]);

  /**
   * Clear error function
   */
  const clearError = useCallback(() => {
    setAuthState(prev => ({ ...prev, error: null }));
  }, []);

  /**
   * Clear all authentication data and force fresh login
   */
  const clearAuth = useCallback(() => {
    localStorage.removeItem('auth-token');
    localStorage.removeItem('auth-user');
    setAuthState({
      isAuthenticated: false,
      user: null,
      token: null,
      loading: false,
      error: null,
      loginAttempts: 0,
      lockedUntil: null,
    });
  }, []);

  // Auto-refresh token every 30 minutes
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const interval = setInterval(() => {
      refreshToken();
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [authState.isAuthenticated, refreshToken]);

  // Check auth status on mount
  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Auto-logout when tab becomes visible (check token validity)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && authState.isAuthenticated) {
        // Check if token is still valid when user returns to tab
        const token = localStorage.getItem('auth-token');
        if (token) {
          try {
            const tokenParts = token.split('.');
            if (tokenParts.length === 3) {
              const payload = JSON.parse(atob(tokenParts[1]));
              const now = Math.floor(Date.now() / 1000);
              
              // Handle both development and production tokens
              const isDevToken = token.endsWith('.dev-signature');
              const isExpired = !isDevToken && payload.exp && payload.exp <= now;
              
              if (isExpired) {
                console.log('Token expired on visibility change, logging out');
                logout();
              }
            } else {
              // Invalid token format
              logout();
            }
          } catch (err) {
            console.error('Error validating token on visibility change:', err);
            logout();
          }
        } else {
          logout();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [authState.isAuthenticated, logout]);

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    refreshToken,
    clearError,
    checkAuthStatus,
    clearAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook to use authentication context
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

/**
 * Hook to check if user has specific permission
 */
export const usePermission = (permission: AdminPermission): boolean => {
  const { user } = useAuth();
  return user?.permissions.includes(permission) || false;
};

/**
 * Hook to check if user has any of the specified permissions
 */
export const useAnyPermission = (permissions: AdminPermission[]): boolean => {
  const { user } = useAuth();
  return permissions.some(permission => 
    user?.permissions.includes(permission)
  ) || false;
};

/**
 * Hook to check if user is admin
 */
export const useIsAdmin = (): boolean => {
  const { user } = useAuth();
  return user?.role === 'admin' && usePermission('admin:access');
};

