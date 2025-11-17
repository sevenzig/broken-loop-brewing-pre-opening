export interface Event {
    slug: string;
    name: string;
    image: string;
    date: string;
    time: string;
    recurring?: string;
    status: string;
    category: string;
    brief_description: string;
    price: string;
    capacity?: string;
    featured?: boolean;
    organizer?: string;
    artist?: string;
    genre?: string;
    content?: string;
    filePath?: string;
}
export interface EventStats {
    total: number;
    active: number;
    upcoming: number;
    trivia: number;
    liveMusic: number;
    tasting: number;
    foodTruck: number;
    special: number;
}
/**
 * Load and process all event markdown files
 * Uses Vite's import.meta.glob for build-time processing
 */
export declare function loadAllEvents(): Promise<Event[]>;
/**
 * Clear the event cache (useful for development)
 */
export declare function clearEventCache(): void;
/**
 * Load a single event by slug
 */
export declare function loadEventBySlug(slug: string): Promise<Event | undefined>;
/**
 * Filter events by status
 */
export declare function filterEventsByStatus(events: Event[], status: string): Event[];
/**
 * Filter events by category
 */
export declare function filterEventsByCategory(events: Event[], category: string): Event[];
/**
 * Get active events (not past or cancelled)
 */
export declare function getActiveEvents(events: Event[]): Event[];
/**
 * Get upcoming events (active events sorted by date)
 */
export declare function getUpcomingEvents(events: Event[]): Event[];
/**
 * Get the next N upcoming events (active, date >= today, sorted by date ascending)
 */
export declare function getNextUpcomingEvents(events: Event[], limit?: number): Event[];
/**
 * Get events by recurring type
 */
export declare function getRecurringEvents(events: Event[], recurring: string): Event[];
/**
 * Get event statistics
 */
export declare function getEventStats(events: Event[]): EventStats;
