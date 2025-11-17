import { Link } from 'react-router-dom';
import styles from './EventCard.module.css';
import type { Event } from '../../hooks/useOptimizedEvents';

interface EventCardProps {
  event: Event;
  showStatus?: boolean;
}

export function EventCard({ event, showStatus = true }: EventCardProps) {
  if (!event) return null;

  const cardClass = styles.card;

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
    // Handle time ranges like "7:00 PM - 9:00 PM"
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

  return (
    <article className={cardClass}>
      <div className={styles.imageContainer}>
        <img 
          src={event.image} 
          alt={event.name}
          className={styles.eventImage}
          loading="lazy"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/images/events/placeholder-event.jpg';
          }}
        />
        

        
        {event.status === 'sold-out' && (
          <span className={styles.soldOutBadge}>Sold Out</span>
        )}
        
        <div className={styles.categoryBadge}>
          <span className={styles.categoryIcon}>{getCategoryIcon(event.category)}</span>
          <span className={styles.categoryLabel}>{getCategoryLabel(event.category)}</span>
        </div>
      </div>
      
      <div className={styles.cardContent}>
        <header className={styles.cardHeader}>
          <h3 className={styles.eventName}>{event.name}</h3>
          <div className={styles.eventMeta}>
            <div className={styles.dateTime}>
              <span className={styles.date}>{formatDate(event.date)}</span>
              <span className={styles.time}>{formatTime(event.time)}</span>
            </div>
          </div>
        </header>
        
        <p className={styles.description}>
          {event.brief_description}
        </p>

        <div className={styles.eventDetails}>
          <div className={styles.detailItem}>
            <span className={styles.detailLabel}>Price:</span>
            <span className={`${styles.detailValue} ${isPaidEvent() ? styles.paid : styles.free}`}>
              {event.price}
            </span>
          </div>
          
          {event.capacity && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Capacity:</span>
              <span className={styles.detailValue}>{event.capacity} people</span>
            </div>
          )}
          
          {event.recurring && (
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Recurring:</span>
              <span className={styles.detailValue}>{event.recurring}</span>
            </div>
          )}
        </div>

        <footer className={styles.cardFooter}>
          <Link 
            to={`/events/${event.slug}`} 
            className={styles.detailsLink}
            aria-label={`Learn more about ${event.name}`}
          >
            Learn More
            <span className={styles.linkArrow} aria-hidden="true">→</span>
          </Link>
          
          {showStatus && (
            <div className={styles.eventStatus}>
              {isUpcoming() ? (
                <span className={styles.upcomingBadge}>Upcoming</span>
              ) : (
                <span className={styles.pastBadge}>Past Event</span>
              )}
            </div>
          )}
        </footer>
      </div>
    </article>
  );
} 