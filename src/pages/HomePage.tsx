import { HeroSection } from '../components/HeroSection/HeroSection';
import { Footer } from '../components/Footer/Footer';
import { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';

// Lazy load ALL non-critical components for faster initial load
const InfoTabs = lazy(() => import('../components/InfoTabs'));
const InstagramSection = lazy(() => import('../components/InstagramSection/InstagramSection'));

// Remove viewport constraints hook - it's causing performance issues
// import { useViewportConstraints } from '../hooks/useViewportConstraints';
import styles from './HomePage.module.css';

export function HomePage() {
  const [activeSection, setActiveSection] = useState(0);
  const [showSecondaryMenu, setShowSecondaryMenu] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const sections = ['Hero', 'InfoTabs', 'Instagram', 'Footer'];
  
  // Simplified ready state - no complex viewport calculations
  useEffect(() => {
    // Simple timeout to ensure DOM is ready
    const timer = setTimeout(() => setIsReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  // Add class to body for full-screen layout
  useEffect(() => {
    document.body.classList.add('homepage-active');
    return () => {
      document.body.classList.remove('homepage-active');
    };
  }, []);

  // Simplified scroll handling - no complex calculations
  useEffect(() => {
    const container = containerRef.current;
    if (!container || !isReady) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const sectionHeight = container.clientHeight;
      const currentSection = Math.round(scrollTop / sectionHeight);
      
      setActiveSection(currentSection);
      
      // Control secondary menu visibility
      const shouldShowSecondaryMenu = currentSection !== 1;
      setShowSecondaryMenu(shouldShowSecondaryMenu);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    
    return () => container.removeEventListener('scroll', handleScroll);
  }, [isReady]);

  // Navigate to specific section
  const scrollToSection = useCallback((index: number) => {
    const container = containerRef.current;
    if (container) {
      const sectionHeight = container.clientHeight;
      container.scrollTo({
        top: index * sectionHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    let nextSection: number;
    let prevSection: number;
    let nextSectionSpace: number;
    
    switch (event.key) {
      case 'ArrowDown':
      case 'PageDown':
        event.preventDefault();
        nextSection = Math.min(activeSection + 1, sections.length - 1);
        scrollToSection(nextSection);
        break;
      case 'ArrowUp':
      case 'PageUp':
        event.preventDefault();
        prevSection = Math.max(activeSection - 1, 0);
        scrollToSection(prevSection);
        break;
      case 'Home':
        event.preventDefault();
        scrollToSection(0);
        break;
      case 'End':
        event.preventDefault();
        scrollToSection(sections.length - 1);
        break;
      case ' ':
        event.preventDefault();
        nextSectionSpace = (activeSection + 1) % sections.length;
        scrollToSection(nextSectionSpace);
        break;
    }
  }, [activeSection, sections.length, scrollToSection]);

  // Add keyboard event listener
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Simplified header communication
  useEffect(() => {
    const event = new CustomEvent('secondaryMenuVisibility', {
      detail: { show: showSecondaryMenu }
    });
    document.dispatchEvent(event);
  }, [showSecondaryMenu]);

  // Removed complex header height calculations for better performance

  // Removed Android-specific optimizations for better performance

  // Don't render until viewport constraints are ready
  if (!isReady) {
    return (
      <div className={styles.homePageContainer} ref={containerRef}>
        <div className={styles.scrollSnapSection}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            height: '100%',
            color: 'var(--color-text-secondary)'
          }}>
            Loading...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={styles.homePageContainer} 
      ref={containerRef}
    >
      <section className={styles.scrollSnapSection}>
        <HeroSection />
      </section>
      <section className={styles.scrollSnapSection}>
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>Loading...</div>}>
          <InfoTabs />
        </Suspense>
      </section>
      {/* <MobileActionButtons /> */}
      {/*<OnTapSection /> */}
      {/*<FoodSection /> */}
      {/*<EventsSection /> */}
      <section className={styles.scrollSnapSection}>
        <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--color-text-secondary)' }}>Loading...</div>}>
          <InstagramSection />
        </Suspense>
      </section>
      <section className={styles.scrollSnapSection}>
        <Footer />
      </section>
      
      {/* Navigation dots */}
      <div className={styles.navigationDots}>
        {sections.map((section, index) => (
          <button
            key={section}
            className={`${styles.navDot} ${activeSection === index ? styles.active : ''}`}
            onClick={() => scrollToSection(index)}
            aria-label={`Go to ${section} section`}
            aria-current={activeSection === index ? 'true' : 'false'}
          />
        ))}
      </div>
    </div>
  );
}