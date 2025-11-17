import React from 'react';
import { businessHoursService } from '../../utils/businessHours';
import styles from './BusinessHoursTooltip.module.css';

interface BusinessHoursTooltipProps {
  isVisible: boolean;
}

const BusinessHoursTooltip: React.FC<BusinessHoursTooltipProps> = ({ isVisible }) => {
  if (!isVisible) return null;

  const businessHours = businessHoursService.getFormattedBusinessHours();
  const status = businessHoursService.getEnhancedStatus();

  return (
    <div className={styles.tooltip}>
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

      <div className={styles.note}>
        All times shown in Eastern Time
      </div>

      {/* Arrow pointing down */}
      <div className={styles.arrow}></div>
    </div>
  );
};

export default BusinessHoursTooltip; 