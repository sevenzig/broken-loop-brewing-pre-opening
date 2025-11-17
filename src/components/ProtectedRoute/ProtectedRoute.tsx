/**
 * Protected Route Component
 * Wrapper component that protects admin routes with authentication
 * Shows modal overlay for unauthenticated users
 */

import React, { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { Lock } from '@phosphor-icons/react/dist/ssr/Lock';
import { useAuth } from '../../contexts/AuthContext';
import { useAuthToast } from '../../contexts/ToastContext';
const AdminLoginPage = React.lazy(() => import('../../pages/AdminLoginPage'));
import styles from './ProtectedRoute.module.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredPermissions?: string[];
  fallback?: React.ReactNode;
  showModal?: boolean;
}

/**
 * Protected Route Wrapper
 * Protects admin routes and shows login modal for unauthorized access
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredPermissions = ['admin:access'],
  fallback,
  showModal = true,
}) => {
  const { isAuthenticated, user, loading } = useAuth();
  const authToast = useAuthToast();
  const location = useLocation();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hasShownUnauthorizedToast = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated && showModal) {
      setShowLoginModal(true);
      // Only show unauthorized toast once per session
      if (!hasShownUnauthorizedToast.current) {
        authToast.unauthorized();
        hasShownUnauthorizedToast.current = true;
      }
    } else {
      setShowLoginModal(false);
      // Reset toast flag when authenticated
      if (isAuthenticated) {
        hasShownUnauthorizedToast.current = false;
      }
    }
  }, [isAuthenticated, loading, showModal]);

  // Show loading state
  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner} />
        <p className={styles.loadingText}>Checking authentication...</p>
      </div>
    );
  }

  // Check authentication
  if (!isAuthenticated) {
    if (showModal && mounted) {
      return (
        <>
          {/* Render children in background (blurred) */}
          <div className={styles.protectedContent} aria-hidden="true">
            {children}
          </div>
          
          {/* Login Modal Overlay */}
          {createPortal(
            <LoginModal 
              isOpen={showLoginModal}
              onClose={() => setShowLoginModal(false)}
              redirectPath={location.pathname}
            />,
            document.body
          )}
        </>
      );
    }
    
    // Redirect to login page if modal is disabled
    return (
      <Navigate 
        to="/admin/login" 
        state={{ 
          from: location,
          message: 'Please log in to access the admin panel'
        }} 
        replace 
      />
    );
  }

  // Check permissions
  if (requiredPermissions.length > 0 && user) {
    const hasAllPermissions = requiredPermissions.every(permission =>
      user.permissions.includes(permission as any)
    );

    if (!hasAllPermissions) {
      if (fallback) {
        return <>{fallback}</>;
      }

      return (
        <div className={styles.permissionDenied}>
          <Lock size={48} className={styles.permissionIcon} />
          <h2 className={styles.permissionTitle}>Access Denied</h2>
          <p className={styles.permissionMessage}>
            You do not have the required permissions to access this resource.
          </p>
          <div className={styles.permissionDetails}>
            <p>Required permissions:</p>
            <ul>
              {requiredPermissions.map(permission => (
                <li key={permission}>{permission}</li>
              ))}
            </ul>
          </div>
        </div>
      );
    }
  }

  // User is authenticated and has required permissions
  return <>{children}</>;
};

/**
 * Login Modal Component
 */
interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  redirectPath: string;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      handleClose();
    }
  };

  if (!isOpen) return null;

  const modalClasses = [
    styles.modalOverlay,
    isClosing ? styles.modalClosing : styles.modalOpen,
  ].join(' ');

  return (
    <div
      className={modalClasses}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      tabIndex={-1}
    >
      <div className={styles.modalContent}>
        <React.Suspense fallback={
          <div className={styles.loadingContainer}>
            <div className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading login form...</p>
          </div>
        }>
          <AdminLoginPage 
            isModal={true}
            onLoginSuccess={() => {
              // Modal will close automatically via useEffect when isAuthenticated changes
            }}
          />
        </React.Suspense>
      </div>
    </div>
  );
};

export default ProtectedRoute;

