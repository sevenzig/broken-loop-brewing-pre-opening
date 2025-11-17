import React from 'react';
import styles from './RouteLoader.module.css';

interface RouteLoaderProps {
  message?: string;
}

export const RouteLoader: React.FC<RouteLoaderProps> = ({ 
  message = 'Loading...' 
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.spinner}>
        <div className={styles.spinnerInner}></div>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default RouteLoader;
