/**
 * Toast Notification Component
 * Accessible toast notifications for authentication feedback and general app notifications
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react/dist/ssr/X';
import { Check } from '@phosphor-icons/react/dist/ssr/Check';
import { Warning } from '@phosphor-icons/react/dist/ssr/Warning';
import { Info } from '@phosphor-icons/react/dist/ssr/Info';
import styles from './Toast.module.css';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastProps {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  persistent?: boolean;
  onClose: (id: string) => void;
}

export interface ToastContainerProps {
  toasts: Array<Omit<ToastProps, 'onClose'>>;
  onClose: (id: string) => void;
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
}

/**
 * Individual Toast Component
 */
export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  persistent = false,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 50);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (persistent) return;

    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, persistent]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match CSS animation duration
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <Check size={20} weight="bold" />;
      case 'error':
        return <Warning size={20} weight="bold" />;
      case 'warning':
        return <Warning size={20} weight="bold" />;
      case 'info':
      default:
        return <Info size={20} weight="bold" />;
    }
  };

  const toastClasses = [
    styles.toast,
    styles[`toast${type.charAt(0).toUpperCase() + type.slice(1)}`],
    isVisible ? styles.toastVisible : '',
    isExiting ? styles.toastExiting : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className={toastClasses}
      role="alert"
      aria-live="polite"
      aria-atomic="true"
    >
      <div className={styles.toastIcon}>
        {getIcon()}
      </div>
      
      <div className={styles.toastContent}>
        <div className={styles.toastTitle}>{title}</div>
        {message && (
          <div className={styles.toastMessage}>{message}</div>
        )}
      </div>
      
      <button
        className={styles.toastCloseButton}
        onClick={handleClose}
        aria-label="Close notification"
        type="button"
      >
        <X size={16} />
      </button>
    </div>
  );
};

/**
 * Toast Container Component
 */

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
  position = 'top-right',
}) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const containerClasses = [
    styles.toastContainer,
    styles[`container${position.charAt(0).toUpperCase() + position.slice(1).replace('-', '')}`],
  ].join(' ');

  return createPortal(
    <div 
      className={containerClasses}
      aria-live="polite"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          {...toast}
          onClose={onClose}
        />
      ))}
    </div>,
    document.body
  );
};
