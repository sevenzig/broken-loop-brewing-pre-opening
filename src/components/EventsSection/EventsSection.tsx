import { Link } from 'react-router-dom';
import styles from './EventsSection.module.css';
import { EventCard } from '../EventCard/EventCard';
import { useEvents } from '../../hooks/useEvents';
import type { Event } from '../../hooks/useOptimizedEvents';

export function EventsSection() {
  const { upcomingEvents, loading, error } = useEvents();

  if (loading) {
    return (
      <section className={styles.eventsSection}>
        <div className={styles.sectionContent}>
          <div className={styles.loadingState}>
            <h2>Loading Upcoming Events...</h2>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.eventsSection}>
        <div className={styles.sectionContent}>
          <div className={styles.errorState}>
            <h2>Upcoming Events</h2>
            <p>Unable to load our events. Please check back soon!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.eventsSection}>
      <div className={styles.sectionContent}>
        <header className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>Upcoming Events</h2>
          <p className={styles.sectionSubtitle}>
            Join us for live music, trivia nights, beer tastings, and special events
          </p>
        </header>

        {upcomingEvents.length > 0 ? (
          <>
            <div className={styles.eventsGrid}>
              {upcomingEvents.map((event: Event) => (
                <EventCard 
                  key={event.slug} 
                  event={event} 

                  showStatus={false}
                />
              ))}
            </div>

            <footer className={styles.sectionFooter}>
              <Link to="/events" className={styles.viewAllButton}>
                View All Events
                <span className={styles.buttonArrow} aria-hidden="true">→</span>
              </Link>
            </footer>
          </>
        ) : (
          <div className={styles.emptyState}>
            <h3>Check Back Soon!</h3>
            <p>We're planning exciting events for you. Follow us on social media for updates on upcoming events.</p>
            <Link to="/events" className={styles.viewAllButton}>
              View Events Calendar
            </Link>
          </div>
        )}
      </div>
    </section>
  );
} 