import React from 'react';
import styles from './ComingSoonSplash.module.css';
import { Button } from '../Button/Button';

export interface ComingSoonSplashProps {
  className?: string;
}

/**
 * ComingSoonSplash - Full-screen splash page for coming soon state
 * 
 * @example
 * <ComingSoonSplash />
 * 
 * @param className - Additional CSS classes
 */
export default function ComingSoonSplash({ className = '' }: ComingSoonSplashProps) {

  // Memoized class names for performance
  const componentClasses = React.useMemo(() => {
    return [styles.splashContainer, className].filter(Boolean).join(' ');
  }, [className]);

  return (
    <div className={componentClasses} role="banner" aria-label="Coming Soon">
      <div className={styles.logoContainer}>
        <img 
          src="/images/logo.png" 
          alt="Broken Loop Brewing Logo" 
          className={styles.logo}
        />
        <div className={styles.tagline}>OPENING SOON</div>
        <Button
          variant="tertiary"
          size="large"
          href="https://mailchi.mp/d96ab4188f7c/brokenloopnewsletter"
          target="_blank"
          rel="noopener noreferrer"
          className={styles.newsletterButton}
        >
          Sign up for updates
        </Button>
      </div>
    </div>
  );
}
