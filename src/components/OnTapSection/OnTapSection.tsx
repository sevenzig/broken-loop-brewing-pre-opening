import { Link } from 'react-router-dom';
import styles from './OnTapSection.module.css';
import { BeerCard } from '../BeerCard/BeerCard';
import { useOptimizedBeers } from '../../hooks/useOptimizedBeers';
import type { Beer } from '../../hooks/useOptimizedBeers';

export function OnTapSection() {
  const { onTapBeers, loading, error } = useOptimizedBeers();

  if (loading) {
    return (
      <section className={styles.onTapSection}>
        <div className={styles.sectionContent}>
          <div className={styles.loadingState}>
            <h2>Loading Our On Tap Beers...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.onTapSection}>
        <div className={styles.sectionContent}>
          <div className={styles.errorState}>
            <h2>Currently On Tap</h2>
            <p>Unable to load our beer selection. Please check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.onTapSection}>
      <div className={styles.sectionContent}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Currently On Tap</h2>
          <p className={styles.sectionSubtitle}>
            Our complete selection of craft beers, freshly tapped and ready to enjoy
          </p>
        </header>

        {onTapBeers.length > 0 ? (
          <>
            <div className={styles.beerGrid}>
              {onTapBeers.map((beer: Beer) => (
                <BeerCard 
                  key={beer.slug} 
                  beer={beer} 

                  showTappedDate={false}
                />
              ))}
            </div>

            <footer className={styles.sectionFooter}>
              <Link to="/beer" className={styles.viewAllButton}>
                View Full Beer Menu
                <span className={styles.buttonArrow} aria-hidden="true">→</span>
              </Link>
            </footer>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>Check Back Soon!</h3>
            <p>We're preparing our next batch of amazing craft beers. Follow us on social media for updates on new taps.</p>
            <Link to="/beer" className={styles.viewAllButton}>
              View All Our Beers
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 