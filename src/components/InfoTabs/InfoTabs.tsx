import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { breweryInfo } from '../../data/breweryInfo';
import type { InfoTabsProps, TabContent, BusinessHoursData, CurrentStatus } from './InfoTabs.types';
import styles from './InfoTabs.module.css';

/**
 * InfoTabs - Mobile-optimized tabbed component for brewery information
 * 
 * @example
 * <InfoTabs initialActiveTab="hours" onTabChange={(tab) => console.log(tab)} />
 * 
 * @param className - Additional CSS classes
 * @param initialActiveTab - Initial active tab (default: 'hours')
 * @param onTabChange - Callback when tab changes
 */
export default function InfoTabs({
  className = '',
  initialActiveTab = 'policies',
  onTabChange,
}: InfoTabsProps) {
  const [activeTab, setActiveTab] = useState<'hours' | 'directions' | 'policies'>(initialActiveTab);
  const [isScrolled, setIsScrolled] = useState(false);
  const policiesRef = useRef<HTMLDivElement>(null);
  
  // Swipe functionality refs and state
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const touchEndX = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Get current status and business hours
  const currentStatus = useMemo((): CurrentStatus => {
    return breweryInfo.getCurrentStatus();
  }, []);

  const businessHours = useMemo((): BusinessHoursData[] => {
    const hours = breweryInfo.getBusinessHours();
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    
    return hours.map(hour => ({
      day: hour.day,
      hours: hour.hours,
      isToday: hour.day === today
    }));
  }, []);

  // Handle tab change
  const handleTabChange = useCallback((tab: 'hours' | 'directions' | 'policies') => {
    setActiveTab(tab);
    onTabChange?.(tab);
  }, [onTabChange]);

  // Swipe functionality
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current) return;
    
    const currentX = e.touches[0].clientX;
    const currentY = e.touches[0].clientY;
    const deltaX = Math.abs(currentX - touchStartX.current);
    const deltaY = Math.abs(currentY - touchStartY.current);
    
    // Determine if this is a horizontal swipe (more horizontal than vertical movement)
    if (deltaX > deltaY && deltaX > 10) {
      isSwiping.current = true;
      e.preventDefault(); // Prevent default scroll behavior during horizontal swipes
    }
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (!touchStartX.current || !isSwiping.current) return;
    
    touchEndX.current = e.changedTouches[0].clientX;
    const deltaX = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 50; // Minimum distance for a swipe to be registered
    
    if (Math.abs(deltaX) > minSwipeDistance) {
      const tabOrder: ('hours' | 'directions' | 'policies')[] = ['hours', 'directions', 'policies'];
      const currentIndex = tabOrder.indexOf(activeTab);
      
      if (deltaX > 0) {
        // Swipe left - go to next tab
        const nextIndex = (currentIndex + 1) % tabOrder.length;
        handleTabChange(tabOrder[nextIndex]);
      } else {
        // Swipe right - go to previous tab
        const prevIndex = currentIndex === 0 ? tabOrder.length - 1 : currentIndex - 1;
        handleTabChange(tabOrder[prevIndex]);
      }
    }
    
    // Reset touch state
    touchStartX.current = 0;
    touchStartY.current = 0;
    touchEndX.current = 0;
    isSwiping.current = false;
  }, [activeTab, handleTabChange]);

  // Handle scroll detection for policies section
  useEffect(() => {
    if (activeTab !== 'policies') return;

    const handleScroll = () => {
      const container = document.querySelector('.homePageContainer') as HTMLElement;
      if (!container) return;
      
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      
      // Hide when scrolled past first viewport (entering second section)
      const shouldHide = scrollTop > viewportHeight * 0.5;
      setIsScrolled(shouldHide);
    };

    // Listen to the scroll-snap container
    const container = document.querySelector('.homePageContainer') as HTMLElement;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      
      // Check initial state
      handleScroll();
      
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [activeTab]);

  // Tab configuration
  const tabs: TabContent[] = useMemo(() => [
    {
      id: 'policies',
      label: 'What to Know Before You Take the Detour to Visit',
      icon: '📋',
      content: (
        <div className={styles.policiesSection} ref={policiesRef}>
          
          <div className={styles.policiesGrid}>
            {/* First row - always visible */}
            <div className={styles.policyItem}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Kid-Friendly</div>
                <div className={styles.policyDescription}>Families are welcome! We just ask that little ones stick with you and respect the space.</div>
              </div>
            </div>
            <div className={styles.policyItem}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Dogs Allowed (Outside Only)</div>
                <div className={styles.policyDescription}>Well-behaved pups are welcome in our outdoor spaces, but not inside the taproom.</div>
              </div>
            </div>
            <div className={styles.policyItem}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Easy Parking</div>
                <div className={styles.policyDescription}>We've got plenty of free on-site parking.</div>
              </div>
            </div>
            <div className={styles.policyItem}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Flights Available</div>
                <div className={styles.policyDescription}>Not sure what to order? Build a custom flight and branch out with something new.</div>
              </div>
            </div>
            <div className={styles.policyItem}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>First-Come, First-Served Seating</div>
                <div className={styles.policyDescription}>All indoor and outdoor tables are open seating—no reservations needed.</div>
              </div>
            </div>
            <div className={styles.policyItem}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Spacious Bar & Taproom</div>
                <div className={styles.policyDescription}>Plenty of room to spread out inside with a variety of seating options.</div>
              </div>
            </div>
            
            {/* Second row - hidden on scroll */}
            <div className={`${styles.policyItem} ${styles.mobileRow2} ${isScrolled ? styles.hidden : ''}`}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Outdoor Patio</div>
                <div className={styles.policyDescription}>A comfortable spot to relax just outside the taproom—perfect for enjoying some fresh air.</div>
              </div>
            </div>
            <div className={`${styles.policyItem} ${styles.mobileRow2} ${isScrolled ? styles.hidden : ''}`}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Expansive Beer Garden</div>
                <div className={styles.policyDescription}>A wide-open space with lawn games and room to stretch out. Ideal for laid-back afternoons.</div>
              </div>
            </div>
            <div className={`${styles.policyItem} ${styles.mobileRow2} ${isScrolled ? styles.hidden : ''}`}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>No Outside Food or Drinks</div>
                <div className={styles.policyDescription}>We've got everything you need right here.</div>
              </div>
            </div>
            <div className={`${styles.policyItem} ${styles.mobileRow2} ${isScrolled ? styles.hidden : ''}`}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Kitchen Hours</div>
                <div className={styles.policyDescription}>Our kitchen closes one hour before the brewery does, so don't wait too long if you're hungry.</div>
              </div>
            </div>
            <div className={`${styles.policyItem} ${styles.mobileRow2} ${isScrolled ? styles.hidden : ''}`}>
              <div className={styles.policyContent}>
                <div className={styles.policyTitle}>Beer To-Go</div>
                <div className={styles.policyDescription}>Cans available to take home.</div>
              </div>
            </div>
          </div>
          
          {/* Scroll to Explore Indicator for Policies */}
          <div className={styles.tabScrollIndicator}>
            <div className={styles.scrollArrow}></div>
            <span className={styles.scrollText}>Scroll to explore</span>
          </div>
        </div>
      )
    },
    {
      id: 'hours',
      label: 'Brewery Hours',
      icon: '🕒',
      content: (
        <div className={styles.hoursSection}>
          {/* Current Status */}
          <div className={`${styles.statusIndicator} ${currentStatus.isOpen ? styles.statusOpen : styles.statusClosed}`}>
            <div className={`${styles.statusIcon} ${currentStatus.isOpen ? styles.open : styles.closed}`} />
            <span>{currentStatus.message}</span>
          </div>

          {/* Business Hours Grid */}
          <div className={styles.hoursGrid}>
            {businessHours.map((hour) => (
              <div 
                key={hour.day} 
                className={`${styles.hoursRow} ${hour.isToday ? styles.today : ''}`}
              >
                <span className={styles.dayName}>{hour.day}</span>
                <span className={styles.hoursText}>{hour.hours}</span>
              </div>
            ))}
          </div>

          {/* Kitchen Note */}
          <div className={styles.kitchenNote}>
            Kitchen closes 1 hour before brewery
          </div>
          
          {/* Menu Buttons */}
          <div className={styles.menuButtonsContainer}>
            <a 
              href="/beer" 
              className={styles.menuButton}
              aria-label="View Beer Menu"
            >
              Beer Menu
            </a>
            <a 
              href="/food" 
              className={styles.menuButton}
              aria-label="View Food Menu"
            >
              Food Menu
            </a>
          </div>
          
          {/* Scroll to Explore Indicator for Hours */}
          <div className={styles.tabScrollIndicator}>
            <div className={styles.scrollArrow}></div>
            <span className={styles.scrollText}>Scroll to explore</span>
          </div>
        </div>
      )
    },
    {
      id: 'directions',
      label: 'Map to the Brewery',
      icon: '📍',
      content: (
        <>
          {/* Map - Clickable for directions */}
          <div className={styles.mapContainer}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${breweryInfo.address.coordinates.latitude},${breweryInfo.address.coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mapLink}
              title="Click to get directions on Google Maps"
            >
              <iframe
                className={styles.mapIframe}
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${breweryInfo.address.coordinates.latitude},${breweryInfo.address.coordinates.longitude}`}
                title="Broken Loop Brewing Location"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </a>
          </div>

          {/* Directions Button - Mobile Only */}
          <div className={styles.directionsButtonContainer}>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${breweryInfo.address.coordinates.latitude},${breweryInfo.address.coordinates.longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.directionsButton}
              aria-label={`Get directions to ${breweryInfo.address.full}`}
            >
              <span className={styles.directionsIcon}>📍</span>
              <span className={styles.directionsText}>Get Directions</span>
            </a>
          </div>

          {/* Info Grid - 2 column layout */}
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>🚗</span>
              <span className={styles.infoText}>{breweryInfo.location.parking}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.infoIcon}>♿</span>
              <span className={styles.infoText}>{breweryInfo.location.accessibility}</span>
            </div>
          </div>
          
          {/* Scroll to Explore Indicator for Directions */}
          <div className={styles.tabScrollIndicator}>
            <div className={styles.scrollArrow}></div>
            <span className={styles.scrollText}>Scroll to explore</span>
          </div>
        </>
      )
    }
  ], [currentStatus, businessHours, isScrolled]);

  // Memoized class names for performance
  const componentClasses = useMemo(() => {
    return [styles.infoTabs, className].filter(Boolean).join(' ');
  }, [className]);

  return (
    <section className={styles.infoTabsSection} aria-label="Brewery Information Tabs">
      <div className={styles.sectionContent}>
        <div className={componentClasses} role="tablist">
          {/* Tab Header */}
          <div className={styles.tabHeader}>
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`${styles.tabButton} ${activeTab === tab.id ? styles.active : ''}`}
                onClick={() => handleTabChange(tab.id)}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={`panel-${tab.id}`}
                id={`tab-${tab.id}`}
              >
                <span className={styles.tabIcon} aria-hidden="true">
                  {tab.icon}
                </span>
                <span className={styles.tabLabel}>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content with Swipe Support */}
          <div 
            className={`${styles.tabContent} ${activeTab === 'directions' ? styles.directionsTab : ''}`}
            ref={tabContentRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'pan-y' }} // Allow vertical scrolling while enabling horizontal swipes
          >
            {tabs.map((tab) => (
              <div
                key={tab.id}
                className={`${styles.tabPanel} ${activeTab === tab.id ? styles.active : ''}`}
                role="tabpanel"
                aria-labelledby={`tab-${tab.id}`}
                id={`panel-${tab.id}`}
                hidden={activeTab !== tab.id}
              >
                {tab.content}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 