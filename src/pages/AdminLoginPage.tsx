/**
 * Admin Login Page
 * Secure login form with validation, rate limiting feedback, and accessibility
 */

import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Eye } from '@phosphor-icons/react/dist/ssr/Eye';
import { EyeSlash } from '@phosphor-icons/react/dist/ssr/EyeSlash';
import { Lock } from '@phosphor-icons/react/dist/ssr/Lock';
import { User } from '@phosphor-icons/react/dist/ssr/User';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import { useAuth } from '../contexts/AuthContext';
import { useAuthToast } from '../contexts/ToastContext';
import type { LoginCredentials } from '../types/auth';
import styles from './AdminLoginPage.module.css';

interface LocationState {
  from?: {
    pathname: string;
  };
  message?: string;
}

interface AdminLoginPageProps {
  onLoginSuccess: () => void;
  isModal?: boolean;
}

/**
 * Admin Login Page Component
 */
export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ 
  onLoginSuccess,
  isModal = false 
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, login, loading, lockedUntil } = useAuth();
  const authToast = useAuthToast();
  
  const [formData, setFormData] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [formErrors, setFormErrors] = useState<Partial<LoginCredentials>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lockoutTimeRemaining, setLockoutTimeRemaining] = useState<number>(0);

  // Get redirect path from location state
  const state = location.state as LocationState;
  const from = state?.from?.pathname || '/admin';

  // Redirect if already authenticated
  if (isAuthenticated && !loading) {
    return <Navigate to={from} replace />;
  }

  // Handle lockout countdown
  useEffect(() => {
    if (!lockedUntil) {
      setLockoutTimeRemaining(0);
      return;
    }

    const updateCountdown = () => {
      const remaining = Math.max(0, new Date(lockedUntil).getTime() - Date.now());
      setLockoutTimeRemaining(Math.ceil(remaining / 1000));
      
      if (remaining <= 0) {
        setLockoutTimeRemaining(0);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    
    return () => clearInterval(interval);
  }, [lockedUntil]);

  /**
   * Validate form fields
   */
  const validateForm = (): boolean => {
    const errors: Partial<LoginCredentials> = {};
    
    if (!formData.username.trim()) {
      errors.username = 'Username is required';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 3) {
      errors.password = 'Password must be at least 3 characters';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (lockoutTimeRemaining > 0) {
      authToast.accountLocked(lockedUntil!);
      return;
    }
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const result = await login(formData);
      
      if (result.success && result.user) {
        authToast.loginSuccess(result.user.username);
        
        // If used in modal context, call success callback instead of navigating
        if (isModal && onLoginSuccess) {
          onLoginSuccess();
        } else {
          navigate(from, { replace: true });
        }
      } else {
        if (result.lockedUntil) {
          authToast.accountLocked(result.lockedUntil);
        } else {
          authToast.loginError(
            result.error || 'Login failed',
            result.attemptsRemaining
          );
        }
      }
    } catch (err) {
      authToast.loginError('Network error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (formErrors[name as keyof LoginCredentials]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  /**
   * Toggle password visibility
   */
  const togglePasswordVisibility = () => {
    setShowPassword(prev => !prev);
  };

  /**
   * Format lockout time
   */
  const formatLockoutTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    }
    return `${remainingSeconds}s`;
  };

  return (
    <div className={isModal ? styles.modalLoginContainer : styles.loginContainer}>
      <div className={styles.loginCard}>
        {/* Header */}
        <div className={styles.loginHeader}>
          <div className={styles.logoContainer}>
            <Lock size={32} className={styles.logoIcon} />
            <h1 className={styles.loginTitle}>Admin Login</h1>
          </div>
          <p className={styles.loginSubtitle}>
            Access the Broken Loop Brewing admin panel
          </p>
        </div>

        {/* Redirect message */}
        {state?.message && (
          <div className={styles.redirectMessage}>
            <Warning size={16} />
            {state.message}
          </div>
        )}

        {/* Lockout warning */}
        {lockoutTimeRemaining > 0 && (
          <div className={styles.lockoutWarning}>
            <Warning size={16} />
            Account locked. Try again in {formatLockoutTime(lockoutTimeRemaining)}.
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className={styles.loginForm} noValidate>
          {/* Username Field */}
          <div className={styles.formGroup}>
            <label htmlFor="username" className={styles.formLabel}>
              Username
            </label>
            <div className={styles.inputContainer}>
              <User size={18} className={styles.inputIcon} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className={`${styles.formInput} ${formErrors.username ? styles.formInputError : ''}`}
                placeholder="Enter your username"
                required
                autoComplete="username"
                disabled={isSubmitting || lockoutTimeRemaining > 0}
                aria-describedby={formErrors.username ? 'username-error' : undefined}
              />
            </div>
            {formErrors.username && (
              <div id="username-error" className={styles.formError} role="alert">
                {formErrors.username}
              </div>
            )}
          </div>

          {/* Password Field */}
          <div className={styles.formGroup}>
            <label htmlFor="password" className={styles.formLabel}>
              Password
            </label>
            <div className={styles.inputContainer}>
              <Lock size={18} className={styles.inputIcon} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`${styles.formInput} ${formErrors.password ? styles.formInputError : ''}`}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                disabled={isSubmitting || lockoutTimeRemaining > 0}
                aria-describedby={formErrors.password ? 'password-error' : undefined}
              />
              <button
                type="button"
                className={styles.passwordToggle}
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                disabled={isSubmitting || lockoutTimeRemaining > 0}
              >
                {showPassword ? <EyeSlash size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {formErrors.password && (
              <div id="password-error" className={styles.formError} role="alert">
                {formErrors.password}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={styles.loginButton}
            disabled={isSubmitting || lockoutTimeRemaining > 0}
            aria-describedby="login-button-status"
          >
            {isSubmitting ? (
              <>
                <div className={styles.loadingSpinner} aria-hidden="true" />
                Signing in...
              </>
            ) : lockoutTimeRemaining > 0 ? (
              `Locked (${formatLockoutTime(lockoutTimeRemaining)})`
            ) : (
              'Sign In'
            )}
          </button>
          
          <div id="login-button-status" className="sr-only" aria-live="polite">
            {isSubmitting ? 'Signing in, please wait' : ''}
          </div>
        </form>

        {/* Security Notice */}
        <div className={styles.securityNotice}>
          <p>
            This is a secure admin area. All login attempts are monitored and logged.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLoginPage;

