import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styles from './Header.module.css';
import { breweryInfo } from '../../data/breweryInfo';
import { useBusinessStatus } from '../../hooks/useBusinessStatus';
import BusinessHoursModal from '../BusinessHoursModal/BusinessHoursModal';
import BusinessHoursTooltip from '../BusinessHoursTooltip/BusinessHoursTooltip';

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isHoursModalOpen, setIsHoursModalOpen] = useState(false);
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);
  const [showSecondaryMenu, setShowSecondaryMenu] = useState(true);
  const headerRef = useRef<HTMLElement>(null);
  
  // Use real-time business status from API instead of static data
  const { businessStatus } = useBusinessStatus();
  
  // Get display information from breweryInfo (which has complete business hours)
  const displayInfo = breweryInfo.getCurrentStatus();
  
  // Use API status for open/closed state, but breweryInfo for display text
  const isOpen = businessStatus?.isOpen ?? displayInfo.isOpen;
  const status = {
    ...displayInfo,
    isOpen
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleHoursClick = () => {
    setIsHoursModalOpen(true);
  };

  const handleHoursModalClose = () => {
    setIsHoursModalOpen(false);
  };

  const handleHoursMouseEnter = () => {
    setIsTooltipVisible(true);
  };

  const handleHoursMouseLeave = () => {
    setIsTooltipVisible(false);
  };

  // Listen for secondary menu visibility events
  useEffect(() => {
    const handleSecondaryMenuVisibility = (event: CustomEvent) => {
      setShowSecondaryMenu(event.detail.show);
    };

    document.addEventListener('secondaryMenuVisibility', handleSecondaryMenuVisibility as EventListener);
    
    // Set initial state
    setShowSecondaryMenu(true);
    
    return () => {
      document.removeEventListener('secondaryMenuVisibility', handleSecondaryMenuVisibility as EventListener);
    };
  }, []);

  // Dispatch header height change event when secondary menu visibility changes
  useEffect(() => {
    // Dispatch custom event to notify HomePage of header height change
    const event = new CustomEvent('headerHeightChange', {
      detail: { showSecondaryMenu }
    });
    document.dispatchEvent(event);
  }, [showSecondaryMenu]);

  // Handle header height calculation for HomePage only
  useEffect(() => {
    // Only apply header height calculation on HomePage
    if (window.location.pathname !== '/') {
      return;
    }

    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const headerHeight = headerRef.current.offsetHeight;
        const availableHeight = window.innerHeight - headerHeight;
        
        document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
        document.documentElement.style.setProperty('--available-height', `${availableHeight}px`);
        
        // Also set on body for better fallback support
        document.body.style.setProperty('--header-height', `${headerHeight}px`);
        document.body.style.setProperty('--available-height', `${availableHeight}px`);
      }
    };
    
    // Use requestAnimationFrame to ensure DOM is ready and layout is complete
    requestAnimationFrame(() => {
      updateHeaderHeight();
      
      // Set up resize observer for dynamic header height changes
      const resizeObserver = new ResizeObserver(() => {
        updateHeaderHeight();
      });
      
      if (headerRef.current) {
        resizeObserver.observe(headerRef.current);
      }
      
      // Also listen for window resize events
      const handleResize = () => {
        updateHeaderHeight();
      };
      
      window.addEventListener('resize', handleResize);
      
      // Cleanup function
      return () => {
        resizeObserver.disconnect();
        window.removeEventListener('resize', handleResize);
      };
    });
  }, []);

  return (
    <header ref={headerRef} className={styles.header}>
      {/* Desktop Header */}
      <div className={styles.headerDesktop}>
        {/* Row 1: Logo + Navigation */}
        <div className={styles.headerRow1}>
          <Link to="/" className={styles.logo}>
            <img src="/images/logo.png" alt={breweryInfo.name} />
          </Link>
          <nav className={styles.navigation}>
            <Link to="/" className={styles.navLink}>Home</Link>
            <Link to="/beer" className={styles.navLink}>Beer</Link>
            <Link to="/food" className={styles.navLink}>Food</Link>
            <Link to="/about" className={styles.navLink}>About</Link>
            <Link to="/events" className={styles.navLink}>Events</Link>
            <Link to="/store" className={styles.onlineStoreButton}>Order Online</Link>
          </nav>
        </div>
        
        {/* Row 2: Business Hours + Directions */}
        <div className={styles.headerRow2}>
          <div 
            className={styles.businessStatus}
            onMouseEnter={handleHoursMouseEnter}
            onMouseLeave={handleHoursMouseLeave}
          >
            <svg 
              className={styles.clockIcon}
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12,6 12,12 16,14"></polyline>
            </svg>
            <span className={styles.businessStatusText}>
              {status.isOpen ? (
                <span>Open now until {status.closingTime}</span>
              ) : (
                <span>Opens {status.nextOpenDay} at {status.openingTime}</span>
              )}
            </span>
            <BusinessHoursTooltip isVisible={isTooltipVisible} />
          </div>
          <a 
            href={`https://maps.google.com/?q=${encodeURIComponent(breweryInfo.address.full)}`}
            className={styles.directionsLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg 
              className={styles.mapIcon}
              width="16" 
              height="16" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <span className={styles.directionsText}>
              <span className={styles.directionsShort}>Get directions</span>
              <span className={styles.directionsFull}>Get directions to {breweryInfo.address.full}</span>
            </span>
          </a>
        </div>
      </div>

      {/* Mobile Header */}
      <div className={styles.headerMobile}>
        {/* Row 1: Logo + Hamburger */}
        <div className={styles.mobileRow1}>
          <Link to="/" className={styles.logo}>
            <img src="/images/logo.png" alt={breweryInfo.name} />
          </Link>
          <button 
            className={`${styles.hamburgerButton} ${isMobileMenuOpen ? styles.open : ''}`}
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
          >
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
            <span className={styles.hamburgerLine}></span>
          </button>
        </div>
        
        {/* Row 2: Business Hours + Call + Directions - Only show when showSecondaryMenu is true */}
        {showSecondaryMenu && (
          <div className={styles.mobileRow2}>
            <button 
              className={styles.businessStatusButton}
              onClick={handleHoursClick}
            >
              <svg 
                className={styles.clockIcon}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12,6 12,12 16,14"></polyline>
              </svg>
              <span className={styles.businessStatusTextFull}>
                {status.isOpen ? (
                  <span>Open now until {status.closingTime}</span>
                ) : (
                  <span>Opens {status.nextOpenDay} at {status.openingTime}</span>
                )}
              </span>
              <span className={styles.businessStatusTextShort}>Hours</span>
            </button>
            <a 
              href={breweryInfo.contact.phone.link}
              className={styles.mobileCallButton}
            >
              <svg 
                className={styles.phoneIcon}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Call us</span>
            </a>
            <a 
              href={`https://maps.google.com/?q=${encodeURIComponent(breweryInfo.address.full)}`}
              className={styles.mobileDirectionsButton}
              target="_blank"
              rel="noopener noreferrer"
            >
              <svg 
                className={styles.mapIcon}
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                <circle cx="12" cy="10" r="3"></circle>
              </svg>
              <span className={styles.directionsTextFull}>Get directions</span>
              <span className={styles.directionsTextShort}>Directions</span>
            </a>
          </div>
        )}
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className={styles.mobileMenuOverlay}>
          <nav className={styles.mobileNavigation}>
            <Link to="/" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Home</Link>
            <Link to="/beer" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Beer</Link>
            <Link to="/food" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Food</Link>
            <Link to="/about" className={styles.mobileNavLink} onClick={toggleMobileMenu}>About</Link>
            <Link to="/events" className={styles.mobileNavLink} onClick={toggleMobileMenu}>Events</Link>
            <Link to="/store" className={styles.mobileLinkButton} onClick={toggleMobileMenu}>Order Online</Link>
          </nav>
        </div>
      )}
      
      {/* Business Hours Modal */}
      <BusinessHoursModal 
        isOpen={isHoursModalOpen} 
        onClose={handleHoursModalClose} 
      />
    </header>
  );
} 