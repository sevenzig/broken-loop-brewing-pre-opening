import React from 'react';
import { businessHoursService } from '../../utils/businessHours';
import styles from './BusinessHoursModal.module.css';

interface BusinessHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BusinessHoursModal: React.FC<BusinessHoursModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const businessHours = businessHoursService.getFormattedBusinessHours();
  const status = businessHoursService.getEnhancedStatus();

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3 className={styles.title}>Business Hours</h3>
          <button className={styles.closeButton} onClick={onClose}>
            ×
          </button>
        </div>
        
        <div className={styles.currentStatus}>
          <div className={`${styles.statusIndicator} ${styles[status.status]}`}>
            {status.statusText}
          </div>
          <div className={styles.statusMessage}>
            {status.message}
          </div>
        </div>

        <div className={styles.hoursGrid}>
          {businessHours.map((dayHours) => (
            <div key={dayHours.day} className={styles.dayRow}>
              <div className={styles.dayName}>{dayHours.day}</div>
              <div className={styles.hours}>{dayHours.hours}</div>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <p className={styles.note}>
            All times shown in Eastern Time
          </p>
        </div>
      </div>
    </div>
  );
};

export default BusinessHoursModal; 