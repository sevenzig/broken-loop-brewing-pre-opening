import { useState } from 'react';
import { useEvents } from '../hooks/useEvents';
import { EventCard } from '../components/EventCard/EventCard';
import styles from './EventsPage.module.css';
import type { Event } from '../hooks/useOptimizedEvents';

type FilterType = 'all' | 'upcoming' | 'trivia' | 'live-music' | 'tasting';

function EventsPage() {
  const { 
    allEvents, 
    upcomingEvents,

    triviaEvents,
    liveMusicEvents,
    tastingEvents,
    loading, 
    error,
    stats 
  } = useEvents();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('upcoming');

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <div className={styles.loadingState}>
            <h1>Loading Our Events...</h1>
            <p>Discovering exciting experiences for you</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <div className={styles.errorState}>
            <h1>Oops! Something Went Wrong</h1>
            <p>{error}</p>
            <p>Please try refreshing the page or check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  const getFilteredEvents = (): Event[] => {
    switch (activeFilter) {
      case 'upcoming':
        return upcomingEvents;
      case 'trivia':
        return triviaEvents;
      case 'live-music':
        return liveMusicEvents;
      case 'tasting':
        return tastingEvents;

      default:
        return allEvents;
    }
  };

  const filteredEvents = getFilteredEvents();

  const filterButtons = [
    { key: 'upcoming' as FilterType, label: 'Upcoming', count: stats.upcoming, icon: '📅' },
    { key: 'all' as FilterType, label: 'All Events', count: stats.total, icon: '🎉' },

    { key: 'trivia' as FilterType, label: 'Trivia', count: stats.trivia, icon: '🧠' },
    { key: 'live-music' as FilterType, label: 'Live Music', count: stats.liveMusic, icon: '🎵' },
    { key: 'tasting' as FilterType, label: 'Tastings', count: stats.tasting, icon: '🍺' },
  ];

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        {/* Page Header */}
        <section className={styles.pageHeader}>
          <div className={styles.headerContent}>
            <h1 className={styles.pageTitle}>Events at Broken Loop Brewing</h1>
            <p className={styles.pageSubtitle}>
              Join us for unforgettable experiences featuring live music, trivia nights, 
              beer tastings, and special events that bring our community together.
            </p>
          </div>
        </section>

        {/* Filter Buttons */}
        <section className={styles.filtersSection}>
          <div className={styles.filterGrid}>
            {filterButtons.map((filter) => (
              <button
                key={filter.key}
                className={`${styles.filterButton} ${
                  activeFilter === filter.key ? styles.filterButtonActive : ''
                }`}
                onClick={() => setActiveFilter(filter.key)}
              >
                <span className={styles.filterIcon}>{filter.icon}</span>
                <span className={styles.filterLabel}>{filter.label}</span>
                <span className={styles.filterCount}>({filter.count})</span>
              </button>
            ))}
          </div>
        </section>

        {/* Events Grid */}
        <section className={styles.eventsSection}>
          {filteredEvents.length > 0 ? (
            <>
              <div className={styles.sectionInfo}>
                <h2 className={styles.sectionTitle}>
                  {activeFilter === 'all' 
                    ? 'All Our Events' 
                    : filterButtons.find(f => f.key === activeFilter)?.label
                  }
                </h2>
                <p className={styles.resultsCount}>
                  {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
                </p>
              </div>
              
              <div className={styles.eventsGrid}>
                {filteredEvents.map((event) => (
                                      <EventCard
                      key={event.slug}
                      event={event}
                    />
                ))}
              </div>
            </>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📅</div>
              <h3>No Events Found</h3>
              <p>
                {activeFilter === 'all' 
                  ? "We're planning exciting events for you. Check back soon!"
                  : `No ${filterButtons.find(f => f.key === activeFilter)?.label.toLowerCase()} available right now.`
                }
              </p>
              {activeFilter !== 'all' && (
                <button 
                  className={styles.resetButton}
                  onClick={() => setActiveFilter('all')}
                >
                  View All Events
                </button>
              )}
            </div>
          )}
        </section>

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContent}>
            <h2>Want to Host Your Event Here?</h2>
            <p>
              Broken Loop Brewing is the perfect venue for private parties, 
              corporate events, and special celebrations. Our spacious taproom 
              and experienced team can help make your event memorable.
            </p>
            <div className={styles.ctaButtons}>
              <a 
                href="mailto:events@brokenloopbrewing.com" 
                className={styles.ctaButton}
              >
                Contact Us About Events
              </a>
              <a 
                href="tel:(555)123-4567" 
                className={styles.ctaButtonSecondary}
              >
                Call (555) 123-4567
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default EventsPage; 