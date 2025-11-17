/**
 * Toast Context
 * Global toast notification management for the application
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ToastContainer, type ToastType } from '../components/Toast/Toast';

interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
}

interface ToastContextType {
  showToast: (toast: Omit<ToastData, 'id'>) => string;
  hideToast: (id: string) => void;
  showSuccess: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => string;
  showError: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => string;
  showWarning: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => string;
  showInfo: (title: string, message?: string, options?: { duration?: number; persistent?: boolean }) => string;
  clearAllToasts: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastProviderProps {
  children: React.ReactNode;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
  maxToasts?: number;
}

/**
 * Toast Provider Component
 */
export const ToastProvider: React.FC<ToastProviderProps> = ({ 
  children, 
  position = 'top-right',
  maxToasts = 5 
}) => {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  /**
   * Generate unique ID for toast
   */
  const generateId = useCallback((): string => {
    return `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  }, []);

  /**
   * Show a toast notification
   */
  const showToast = useCallback((toast: Omit<ToastData, 'id'>): string => {
    const id = generateId();
    const newToast: ToastData = { ...toast, id };
    
    setToasts(prev => {
      const updatedToasts = [newToast, ...prev];
      // Limit number of toasts
      return updatedToasts.slice(0, maxToasts);
    });
    
    return id;
  }, [generateId, maxToasts]);

  /**
   * Hide a specific toast
   */
  const hideToast = useCallback((id: string): void => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  /**
   * Show success toast
   */
  const showSuccess = useCallback((
    title: string, 
    message?: string, 
    options?: { duration?: number; persistent?: boolean }
  ): string => {
    return showToast({
      type: 'success',
      title,
      message,
      duration: options?.duration,
      persistent: options?.persistent,
    });
  }, [showToast]);

  /**
   * Show error toast
   */
  const showError = useCallback((
    title: string, 
    message?: string, 
    options?: { duration?: number; persistent?: boolean }
  ): string => {
    return showToast({
      type: 'error',
      title,
      message,
      duration: options?.duration || 8000, // Longer duration for errors
      persistent: options?.persistent,
    });
  }, [showToast]);

  /**
   * Show warning toast
   */
  const showWarning = useCallback((
    title: string, 
    message?: string, 
    options?: { duration?: number; persistent?: boolean }
  ): string => {
    return showToast({
      type: 'warning',
      title,
      message,
      duration: options?.duration || 6000, // Slightly longer for warnings
      persistent: options?.persistent,
    });
  }, [showToast]);

  /**
   * Show info toast
   */
  const showInfo = useCallback((
    title: string, 
    message?: string, 
    options?: { duration?: number; persistent?: boolean }
  ): string => {
    return showToast({
      type: 'info',
      title,
      message,
      duration: options?.duration,
      persistent: options?.persistent,
    });
  }, [showToast]);

  /**
   * Clear all toasts
   */
  const clearAllToasts = useCallback((): void => {
    setToasts([]);
  }, []);

  const contextValue: ToastContextType = {
    showToast,
    hideToast,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer 
        toasts={toasts}
        onClose={hideToast}
        position={position}
      />
    </ToastContext.Provider>
  );
};

/**
 * Hook to use toast notifications
 */
export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

/**
 * Convenience hook for authentication-specific toasts
 */
export const useAuthToast = () => {
  const toast = useToast();
  
  return {
    loginSuccess: (username: string) => {
      toast.showSuccess(
        'Login Successful',
        `Welcome back, ${username}!`
      );
    },
    
    loginError: (message: string, attemptsRemaining?: number) => {
      const title = 'Login Failed';
      const errorMessage = attemptsRemaining !== undefined && attemptsRemaining > 0
        ? `${message} (${attemptsRemaining} attempts remaining)`
        : message;
      
      toast.showError(title, errorMessage, { duration: 8000 });
    },
    
    accountLocked: (lockedUntil: string) => {
      const lockoutTime = Math.ceil((new Date(lockedUntil).getTime() - Date.now()) / 1000 / 60);
      toast.showError(
        'Account Locked',
        `Too many failed attempts. Try again in ${lockoutTime} minutes.`,
        { persistent: true }
      );
    },
    
    logoutSuccess: () => {
      toast.showInfo('Logged Out', 'You have been successfully logged out.');
    },
    
    sessionExpired: () => {
      toast.showWarning(
        'Session Expired',
        'Your session has expired. Please log in again.',
        { duration: 8000 }
      );
    },
    
    tokenRefreshed: () => {
      toast.showInfo(
        'Session Extended',
        'Your session has been automatically extended.',
        { duration: 3000 }
      );
    },
    
    unauthorized: () => {
      toast.showError(
        'Unauthorized Access',
        'You do not have permission to access this resource.',
        { duration: 6000 }
      );
    },
  };
};

