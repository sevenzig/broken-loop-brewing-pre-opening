/**
 * Compatibility layer for existing useEvents hook
 * Delegates to optimized hooks that use pre-processed JSON data
 */

import { 
  useOptimizedEvents,
  useOptimizedEvent,
  getNextUpcomingEvents,
  type Event
} from './useOptimizedEvents';

// Re-export optimized hooks with original names for backward compatibility
export const useEvents = useOptimizedEvents;
export const useEvent = useOptimizedEvent;

// Re-export utility functions
export { getNextUpcomingEvents };

// Re-export types
export type { Event };