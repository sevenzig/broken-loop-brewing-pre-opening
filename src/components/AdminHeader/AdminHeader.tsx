import React from 'react';
import { Link } from 'react-router-dom';
import styles from './AdminHeader.module.css';

export interface AdminHeaderProps {
  className?: string;
}

/**
 * AdminHeader - Simple header component for admin panel
 * 
 * Features:
 * - Business logo that links to home page
 * - Clean, minimal design
 * - Responsive layout
 * 
 * @param className - Additional CSS classes
 */
export const AdminHeader: React.FC<AdminHeaderProps> = ({ className = '' }) => {
  return (
    <header className={`${styles.adminHeader} ${className}`}>
      <div className={styles.headerContent}>
        <Link to="/" className={styles.logoLink} aria-label="Return to Broken Loop Brewing homepage">
          <div className={styles.logoContainer}>
            <img 
              src="/images/logo.svg" 
              alt="Broken Loop Brewing" 
              className={styles.logo}
            />
            <span className={styles.logoText}>Broken Loop Brewing</span>
          </div>
        </Link>
      </div>
    </header>
  );
};

export default AdminHeader;
