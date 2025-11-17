import React from 'react';
import styles from './Button.module.css';

export interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'transparent';
  size?: 'small' | 'medium' | 'large';
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  rel?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  children,
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
  className = '',
  fullWidth = false,
  href,
  target,
  rel,
  ...props
}: ButtonProps) {
  const baseClass = styles.button;
  const variantClass = styles[variant];
  const sizeClass = styles[size];
  const fullWidthClass = fullWidth ? styles.fullWidth : '';
  const loadingClass = loading ? styles.loading : '';
  
  const combinedClassName = [
    baseClass,
    variantClass,
    sizeClass,
    fullWidthClass,
    loadingClass,
    className
  ].filter(Boolean).join(' ');





  // If href is provided, render as anchor tag
  if (href) {
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        className={combinedClassName}
        onClick={onClick}
        {...props}
      >
        {children}
      </a>
    );
  }

  // Otherwise render as button
  return (
    <button
      type={type}
      className={combinedClassName}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {children}
      {loading && (
        <div 
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '20px',
            height: '20px',
            margin: '-10px 0 0 -10px',
            border: '2px solid transparent',
            borderTop: `2px solid ${variant === 'primary' || variant === 'tertiary' ? 'white' : variant === 'secondary' ? 'var(--color-primary)' : 'var(--color-text)'}`,
            borderRadius: '50%',
            animation: 'buttonSpin 1s linear infinite',
            zIndex: 1
          }}
        />
      )}
    </button>
  );
} 