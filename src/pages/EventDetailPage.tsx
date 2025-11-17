import { useParams, Link } from 'react-router-dom';
import { useEvent } from '../hooks/useEvents';
import styles from './EventDetailPage.module.css';

function EventDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { event, loading, error } = useEvent(slug || '');

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading event details...</p>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>Event Not Found</h1>
          <p className={styles.errorMessage}>
            {error || `Sorry, we couldn't find an event with the slug "${slug}".`}
          </p>
          <Link to="/events" className={styles.backLink}>
            ← Back to Events
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'trivia':
        return '🧠';
      case 'live-music':
        return '🎵';
      case 'tasting':
        return '🍺';
      case 'food-truck':
        return '🚚';
      case 'special':
        return '⭐';
      default:
        return '📅';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'trivia':
        return 'Trivia Night';
      case 'live-music':
        return 'Live Music';
      case 'tasting':
        return 'Beer Tasting';
      case 'food-truck':
        return 'Food Truck';
      case 'special':
        return 'Special Event';
      default:
        return 'Event';
    }
  };

  const isUpcoming = () => {
    const eventDate = new Date(event.date);
    const now = new Date();
    return eventDate >= now;
  };

  const isPaidEvent = () => {
    return event.price && event.price.toLowerCase() !== 'free';
  };

  const getEventStatusBadge = () => {
    if (event.status === 'sold-out') {
      return <span className={styles.soldOutBadge}>Sold Out</span>;
    }
    
    if (isUpcoming()) {
      return <span className={styles.upcomingBadge}>Upcoming</span>;
    } else {
      return <span className={styles.pastBadge}>Past Event</span>;
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <nav className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <Link to="/events" className={styles.breadcrumbLink}>Events</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbCurrent}>{event.name}</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.eventContainer}>
          {/* Event Hero */}
          <section className={styles.eventHero}>
            <div className={styles.eventImageContainer}>
              <img 
                src={event.image} 
                alt={event.name}
                className={styles.eventImage}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/images/events/placeholder-event.jpg';
                }}
              />
              
              {/* Overlay Badges */}
              <div className={styles.badgeContainer}>

                
                <div className={styles.categoryBadge}>
                  <span className={styles.categoryIcon}>{getCategoryIcon(event.category)}</span>
                  <span className={styles.categoryLabel}>{getCategoryLabel(event.category)}</span>
                </div>
              </div>
            </div>

            <div className={styles.eventInfo}>
              <div className={styles.eventHeader}>
                <h1 className={styles.eventTitle}>{event.name}</h1>
                {getEventStatusBadge()}
              </div>

              <div className={styles.eventMeta}>
                <div className={styles.metaItem}>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Date</span>
                    <span className={styles.metaValue}>{formatDate(event.date)}</span>
                  </div>
                </div>

                <div className={styles.metaItem}>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Time</span>
                    <span className={styles.metaValue}>{formatTime(event.time)}</span>
                  </div>
                </div>

                <div className={styles.metaItem}>
                  <div className={styles.metaContent}>
                    <span className={styles.metaLabel}>Price</span>
                    <span className={`${styles.metaValue} ${isPaidEvent() ? styles.paid : styles.free}`}>
                      {event.price}
                    </span>
                  </div>
                </div>

                {event.capacity && (
                  <div className={styles.metaItem}>
                    <div className={styles.metaContent}>
                      <span className={styles.metaLabel}>Capacity</span>
                      <span className={styles.metaValue}>{event.capacity} people</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={styles.eventDescription}>
                <p className={styles.briefDescription}>{event.brief_description}</p>
              </div>
            </div>
          </section>

          {/* Event Details */}
          <section className={styles.eventDetails}>
            <div className={styles.detailsContent}>
              <h2 className={styles.detailsTitle}>Event Details</h2>
              <div 
                className={styles.eventContent}
                dangerouslySetInnerHTML={{ __html: event.content || '' }}
              />
            </div>
          </section>

          {/* Call to Action */}
          <section className={styles.callToAction}>
            <div className={styles.ctaContent}>
              {event.status === 'sold-out' ? (
                <div className={styles.soldOutMessage}>
                  <h3>This Event is Sold Out</h3>
                  <p>Check out our other upcoming events or follow us on social media for updates!</p>
                </div>
              ) : isUpcoming() ? (
                <div className={styles.upcomingMessage}>
                  <h3>Join Us for This Event!</h3>
                  <p>Mark your calendar and we'll see you there. No reservations needed unless specified.</p>
                </div>
              ) : (
                <div className={styles.pastMessage}>
                  <h3>Thanks for Your Interest!</h3>
                  <p>This event has already passed. Check out our upcoming events below.</p>
                </div>
              )}
              
              <div className={styles.ctaButtons}>
                <Link to="/events" className={styles.primaryButton}>
                  View All Events
                  <span className={styles.buttonArrow} aria-hidden="true">→</span>
                </Link>
                <Link to="/" className={styles.secondaryButton}>
                  Back to Home
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default EventDetailPage; 