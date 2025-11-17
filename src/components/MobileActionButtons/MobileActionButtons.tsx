import styles from './MobileActionButtons.module.css';

export function MobileActionButtons() {
  const handleOrderOnlineClick = () => {
    // For now, navigate to the store page or external ordering system
    window.open('/store', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={styles.mobileActionButtons}>
      <div className={styles.buttonContainer}>
        <button 
          onClick={handleOrderOnlineClick}
          className={styles.orderButton}
          aria-label="Order online for pickup or delivery"
        >
          <span className={styles.buttonText}>Order Online</span>
        </button>
      </div>
    </section>
  );
} 