import { useState, useEffect, useMemo } from 'react';

export interface Event {
  slug: string;
  name: string;
  image: string;
  date: string;
  time: string;
  brief_description: string;
  status: string;
  category: string;
  price?: string;
  capacity?: string;
  location?: string;
  registration_required?: boolean;
  contact_info?: string;
  tags?: string[];
  featured?: boolean;
  recurring?: string;
  organizer?: string;
  content?: string; // Pre-processed HTML content
  markdown?: string; // Original markdown for admin editing
  uuid: string;
}

/**
 * Optimized hook that uses pre-processed JSON data instead of runtime markdown processing
 * This eliminates gray-matter, remark, and remark-html from the client bundle
 */
export function useOptimizedEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/data/events.json');
      if (!response.ok) {
        throw new Error(`Failed to load events: ${response.status} ${response.statusText}`);
      }
      
      const eventsData = await response.json();
      setAllEvents(eventsData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load events';
      setError(errorMessage);
      console.error('Error loading events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Memoized filtered event arrays for performance
  const featuredEvents = useMemo(() => 
    allEvents.filter(event => event.featured), 
    [allEvents]
  );

  const upcomingEvents = useMemo(() => {
    const now = new Date();
    return allEvents.filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [allEvents]);

  const recurringEvents = useMemo(() => 
    allEvents.filter(event => event.recurring), 
    [allEvents]
  );

  const triviaEvents = useMemo(() => 
    allEvents.filter(event => event.category === 'trivia'), 
    [allEvents]
  );

  const liveMusicEvents = useMemo(() => 
    allEvents.filter(event => event.category === 'live-music'), 
    [allEvents]
  );

  const tastingEvents = useMemo(() => 
    allEvents.filter(event => event.category === 'tasting'), 
    [allEvents]
  );

  // Event statistics
  const stats = useMemo(() => ({
    total: allEvents.length,
    upcoming: upcomingEvents.length,
    featured: featuredEvents.length,
    recurring: recurringEvents.length,
    trivia: triviaEvents.length,
    liveMusic: liveMusicEvents.length,
    tasting: tastingEvents.length,
  }), [allEvents, upcomingEvents, featuredEvents, recurringEvents, triviaEvents, liveMusicEvents, tastingEvents]);

  return {
    allEvents,
    featuredEvents,
    upcomingEvents,
    recurringEvents,
    triviaEvents,
    liveMusicEvents,
    tastingEvents,
    stats,
    loading,
    error,
    reload: loadEvents,
  };
}

/**
 * Optimized hook for getting a single event by slug using pre-processed data
 */
export function useOptimizedEvent(slug: string) {
  const { allEvents, loading, error } = useOptimizedEvents();

  const event = useMemo(() => 
    allEvents.find(event => event.slug === slug) || null, 
    [allEvents, slug]
  );

  return {
    event,
    loading,
    error,
  };
}

/**
 * Get next upcoming events (used by business info)
 */
export function getNextUpcomingEvents(events: Event[], limit: number = 3): Event[] {
  const now = new Date();
  return events
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now;
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, limit);
}
