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
  artist?: string;
  genre?: string;
  content?: string;
  markdown?: string;
  uuid: string;
}

export function useOptimizedEvents() {
  const [allEvents, setAllEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/events?limit=200');
      if (!response.ok) {
        throw new Error(`Failed to load events: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setAllEvents(result.events ?? result);
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

export function useOptimizedEvent(slug: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadEvent = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/events/${encodeURIComponent(slug)}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Event not found');
          } else {
            throw new Error(`Failed to load event: ${response.status}`);
          }
          return;
        }

        const result = await response.json();
        setEvent(result.event ?? result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load event');
        console.error('Error loading event:', err);
      } finally {
        setLoading(false);
      }
    };

    loadEvent();
  }, [slug]);

  return { event, loading, error };
}

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
