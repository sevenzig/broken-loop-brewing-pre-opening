import { useState, useEffect, useRef, useCallback } from 'react';

export interface ViewportConstraints {
  headerHeight: number;
  availableHeight: number;
  isReady: boolean;
  updateConstraints: () => void;
}

/**
 * Hook for managing viewport-constrained layouts
 * Handles header height calculations and responsive behavior
 */
export function useViewportConstraints(): ViewportConstraints {
  const [headerHeight, setHeaderHeight] = useState(0);
  const [availableHeight, setAvailableHeight] = useState(window.innerHeight);
  const [isReady, setIsReady] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const lastHeaderHeight = useRef<number>(0);

  const updateConstraints = useCallback(() => {
    // Find header element
    if (!headerRef.current) {
      headerRef.current = document.querySelector('header');
    }

    if (headerRef.current) {
      const newHeaderHeight = headerRef.current.offsetHeight;
      const newAvailableHeight = window.innerHeight - newHeaderHeight;

      // Only update if header height actually changed
      if (newHeaderHeight !== lastHeaderHeight.current) {
        lastHeaderHeight.current = newHeaderHeight;
        
        setHeaderHeight(newHeaderHeight);
        setAvailableHeight(newAvailableHeight);

        // Update CSS custom properties
        document.documentElement.style.setProperty('--header-height', `${newHeaderHeight}px`);
        document.documentElement.style.setProperty('--available-height', `${newAvailableHeight}px`);
        document.body.style.setProperty('--header-height', `${newHeaderHeight}px`);
        document.body.style.setProperty('--available-height', `${newAvailableHeight}px`);

        // Dispatch custom event for components that need to know about header height changes
        const event = new CustomEvent('headerHeightChanged', {
          detail: { 
            headerHeight: newHeaderHeight, 
            availableHeight: newAvailableHeight 
          }
        });
        document.dispatchEvent(event);

        // Only set isReady once
        if (!isReady) {
          setIsReady(true);
        }
      }
    }
  }, [isReady]);

  useEffect(() => {
    // Initial setup
    updateConstraints();

    // Set up resize observer for header
    const resizeObserver = new ResizeObserver(() => {
      updateConstraints();
    });

    if (headerRef.current) {
      resizeObserver.observe(headerRef.current);
    }

    // Listen for window resize
    const handleResize = () => {
      updateConstraints();
    };

    // Listen for orientation changes (important for mobile)
    const handleOrientationChange = () => {
      // Delay to ensure DOM is updated
      setTimeout(updateConstraints, 100);
    };

    // Listen for custom header height change events
    const handleHeaderHeightChange = () => {
      updateConstraints();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleOrientationChange);
    document.addEventListener('headerHeightChange', handleHeaderHeightChange);

    // Cleanup
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleOrientationChange);
      document.removeEventListener('headerHeightChange', handleHeaderHeightChange);
    };
  }, [updateConstraints]);

  // Additional effect for Android-specific optimizations
  useEffect(() => {
    // Always set up the effect, but only execute logic when ready
    const forceReflow = () => {
      if (navigator.userAgent.includes('Android')) {
        // Force layout recalculation on Android
        void document.body.offsetHeight; // Use void to avoid linting error
        
        // Update constraints again after reflow
        setTimeout(updateConstraints, 50);
      }
    };

    // Listen for visibility changes (important for mobile apps)
    const handleVisibilityChange = () => {
      if (!document.hidden && isReady) {
        forceReflow();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isReady, updateConstraints]);

  return {
    headerHeight,
    availableHeight,
    isReady,
    updateConstraints,
  };
}
