import styles from './HeroSection.module.css';
import { breweryInfo } from '../../data/breweryInfo';

export function HeroSection() {
  const handleOrderOnlineClick = () => {
    // For now, navigate to the store page or external ordering system
    window.open('/store', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className={styles.heroSection}>
      <div className={styles.heroBackground}>
        <img 
          src="/images/hero-bg.jpg" 
          alt="Broken Loop Brewing interior" 
          className={styles.heroImage}
          loading="eager"
          fetchPriority="high"
        />
        <div className={styles.overlay}></div>
      </div>
      <div className={styles.heroContentWrapper}>
        {/* Removed heroContentBlur overlay */}
        <div className={styles.heroContent}>
          <div className={styles.contentContainer}>
            <h1 className={styles.heroTitle}>
              {breweryInfo.shortTagline}
            </h1>
            <p className={styles.heroTagline}>
              {breweryInfo.tagline}
            </p>
            <div className={styles.heroActions}>
              <a 
                href="/beer" 
                className={styles.secondaryButton}
                aria-label="View Beer Menu"
              >
                Beer Menu
              </a>
              <a 
                href="/food" 
                className={styles.secondaryButton}
                aria-label="View Food Menu"
              >
                Food Menu
              </a>
            </div>
            <div className={styles.orderButtonContainer}>
              <button 
                onClick={handleOrderOnlineClick}
                className={styles.orderButton}
                aria-label="Order online for pickup or delivery"
              >
                Order Online
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scroll indicator */}
      <div className={styles.scrollIndicator}>
        <div className={styles.scrollArrow}></div>
        <span className={styles.scrollText}>Scroll to explore</span>
      </div>
    </section>
  );
} 