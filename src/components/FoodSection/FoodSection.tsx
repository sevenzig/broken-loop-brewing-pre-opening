import { Link } from 'react-router-dom';
import styles from './FoodSection.module.css';

export function FoodSection() {
  return (
    <section className={styles.foodSection}>
      <div className={styles.sectionContent}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Food Menu</h2>
        </header>
        
        <div className={styles.sectionBody}>
          <p className={styles.description}>
            Our kitchen serves up slow-smoked BBQ made with love and the finest ingredients. 
            From tender brisket to fall-off-the-bone ribs, every dish is designed to complement 
            our craft beer selection perfectly.
          </p>
          
          <div className={styles.actionButtons}>
            <Link to="/food" className={styles.primaryButton}>
              View Full Menu
              <span className={styles.buttonArrow} aria-hidden="true">→</span>
            </Link>
            
            <Link to="/food?filter=specials" className={styles.secondaryButton}>
              View Our Specials
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
} 