import React, { useState, useEffect } from 'react';
import { useOptimizedBeerStyleByName, createFallbackStyleInfo } from '../../hooks/useOptimizedBeerStyles';
import type { BeerStyleInfo } from '../../hooks/useOptimizedBeerStyles';
import styles from './BeerStyleTooltip.module.css';

interface BeerStyleTooltipProps {
  styleName: string;
  children: React.ReactNode;
  className?: string;
}

const BeerStyleTooltip: React.FC<BeerStyleTooltipProps> = ({ styleName, children, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [hideTimeout, setHideTimeout] = useState<NodeJS.Timeout | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<'left' | 'right'>('left');
  const containerRef = React.useRef<HTMLDivElement>(null);
  
  // Use optimized hook for beer style data
  const { style: styleInfo, loading: isLoading, error } = useOptimizedBeerStyleByName(styleName);

  // Check if we're on mobile/tablet
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Fallback style info when style is not found
  const displayStyleInfo: BeerStyleInfo = styleInfo || createFallbackStyleInfo(styleName);



  // Calculate tooltip position based on viewport
  const calculateTooltipPosition = () => {
    if (!containerRef.current || isMobile) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const tooltipWidth = window.innerWidth >= 1200 ? 650 : 
                       window.innerWidth >= 1024 ? 550 : 
                       window.innerWidth >= 769 ? 480 : 320;
    
    // If there's not enough space on the right, align to the right
    const spaceOnRight = viewportWidth - rect.right;
    if (spaceOnRight < tooltipWidth + 20) {
      setTooltipPosition('right');
    } else {
      setTooltipPosition('left');
    }
  };

  const handleMouseEnter = () => {
    // Clear any pending hide timeout
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      setHideTimeout(null);
    }
    
    if (!isVisible) {
      calculateTooltipPosition();
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    // Add delay before hiding to make it more forgiving
    const timeout = setTimeout(() => {
      setIsVisible(false);
    }, 300); // 300ms delay
    setHideTimeout(timeout);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isVisible) {
      calculateTooltipPosition();
    }
    setIsVisible(!isVisible);
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  // Close on outside click
  useEffect(() => {
    if (!isVisible) return;

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest(`.${styles.container}`)) {
        setIsVisible(false);
      }
    };

    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, [isVisible]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }
    };
  }, [hideTimeout]);

  return (
    <div 
      ref={containerRef}
      className={`${styles.container} ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span 
        className={styles.trigger}
        onClick={handleClick}
      >
        {children}
      </span>
      
      {isVisible && (
        <div 
          className={`${styles.tooltip} ${tooltipPosition === 'right' ? styles.tooltipRight : styles.tooltipLeft}`}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <div className={styles.header}>
            <div className={styles.headerContent}>
              <h4 className={styles.title}>
                {displayStyleInfo?.style_code && `${displayStyleInfo.style_code}. `}
                {displayStyleInfo?.style_name || styleName}
              </h4>
              {displayStyleInfo?.category_name && (
                <p className={styles.category}>{displayStyleInfo.category_name}</p>
              )}
            </div>
            <button 
              className={styles.closeButton}
              onClick={handleClose}
              aria-label="Close tooltip"
            >
              ×
            </button>
          </div>

          <div className={styles.content}>
            {isLoading && (
              <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <p>Loading style information...</p>
              </div>
            )}

            {error && (
              <div className={styles.error}>
                <p>Unable to load detailed style information.</p>
              </div>
            )}

            {displayStyleInfo && !isLoading && (
              <>
                <div className={styles.section}>
                  <h5 className={styles.sectionTitle}>Overall Impression</h5>
                  <p className={styles.sectionContent}>
                    {displayStyleInfo.overall_impression}
                  </p>
                </div>

                {displayStyleInfo.vital_stats && (
                  <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Vital Statistics</h5>
                    <div className={styles.stats}>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>ABV:</span>
                        <span className={styles.statValue}>{displayStyleInfo.vital_stats.abv}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>IBU:</span>
                        <span className={styles.statValue}>{displayStyleInfo.vital_stats.ibu}</span>
                      </div>
                      <div className={styles.statItem}>
                        <span className={styles.statLabel}>SRM:</span>
                        <span className={styles.statValue}>{displayStyleInfo.vital_stats.srm}</span>
                      </div>
                    </div>
                  </div>
                )}

                {displayStyleInfo.aroma && (
                  <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Aroma</h5>
                    <p className={styles.sectionContent}>
                      {displayStyleInfo.aroma}
                    </p>
                  </div>
                )}

                {displayStyleInfo.flavor && (
                  <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Flavor</h5>
                    <p className={styles.sectionContent}>
                      {displayStyleInfo.flavor}
                    </p>
                  </div>
                )}

                {displayStyleInfo.appearance && (
                  <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Appearance</h5>
                    <p className={styles.sectionContent}>
                      {displayStyleInfo.appearance}
                    </p>
                  </div>
                )}

                {displayStyleInfo.mouthfeel && (
                  <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Mouthfeel</h5>
                    <p className={styles.sectionContent}>
                      {displayStyleInfo.mouthfeel}
                    </p>
                  </div>
                )}

                {displayStyleInfo.history && (
                  <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>History</h5>
                    <p className={styles.sectionContent}>
                      {displayStyleInfo.history}
                    </p>
                  </div>
                )}

                {displayStyleInfo.comments && (
                  <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Comments</h5>
                    <p className={styles.sectionContent}>
                      {displayStyleInfo.comments}
                    </p>
                  </div>
                )}

                {displayStyleInfo.commercial_examples && (
                  <div className={styles.section}>
                    <h5 className={styles.sectionTitle}>Commercial Examples</h5>
                    <div className={styles.sectionContent}>
                      {displayStyleInfo.commercial_examples.american && (
                        <p><strong>American:</strong> {displayStyleInfo.commercial_examples.american.join(', ')}</p>
                      )}
                      {displayStyleInfo.commercial_examples.english && (
                        <p><strong>English:</strong> {displayStyleInfo.commercial_examples.english.join(', ')}</p>
                      )}
                      {displayStyleInfo.commercial_examples.other && (
                        <p><strong>Other:</strong> {displayStyleInfo.commercial_examples.other.join(', ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <div className={styles.footer}>
            <p className={styles.attribution}>
              Information from BJCP 2021 Style Guidelines
            </p>
          </div>

          <div className={styles.arrow}></div>
        </div>
      )}
    </div>
  );
};

export default BeerStyleTooltip; 