import { useEffect, useState } from 'react';
import styles from './InstagramSection.module.css';
import { breweryInfo } from '../../data/breweryInfo';

function InstagramSection() {
  const [viewportHeight, setViewportHeight] = useState(0);
  const [safeAreaBottom, setSafeAreaBottom] = useState(0);

  // Instagram images from the public/images/instagram directory
  const instagramImages = [
    '/images/instagram/298093377_5644920585552610_3568609558196010170_n.jpg',
    '/images/instagram/298533313_784845409367525_3325119363217532229_n.jpg',
    '/images/instagram/305440860_133280975868055_583812463728158566_n.jpg',
    '/images/instagram/311068974_1688289894877101_6664461975772253802_n.jpg',
    '/images/instagram/460123150_1052275219824599_9133413414400363292_n.jpg',
    '/images/instagram/491464273_17987330717807062_6016970077638624580_n.jpg',
  ];

  useEffect(() => {
    // Function to update viewport dimensions
    const updateViewport = () => {
      const currentHeight = window.innerHeight;
      setViewportHeight(currentHeight);
      
      // Get safe area inset for Android soft keys
      const safeAreaBottomValue = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--sat') || '0'
      );
      
      // Fallback: estimate Android soft key height if safe area not available
      const estimatedSoftKeyHeight = window.innerHeight < 800 ? 80 : 0;
      const finalSafeArea = Math.max(safeAreaBottomValue, estimatedSoftKeyHeight);
      
      setSafeAreaBottom(finalSafeArea);
    };

    // Initial update
    updateViewport();

    // Update on resize and orientation change
    window.addEventListener('resize', updateViewport);
    window.addEventListener('orientationchange', updateViewport);
    
    // Also listen for visual viewport changes (important for mobile)
    if ('visualViewport' in window) {
      (window as any).visualViewport.addEventListener('resize', updateViewport);
    }

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewport);
      window.removeEventListener('orientationchange', updateViewport);
      if ('visualViewport' in window) {
        (window as any).visualViewport.removeEventListener('resize', updateViewport);
      }
    };
  }, []);

  // Calculate dynamic styles based on viewport
  const getDynamicStyles = () => {
    const availableHeight = viewportHeight - safeAreaBottom;
    const isMobile = window.innerWidth <= 768;
    
    // Ensure we have enough space for content + soft keys
    const contentHeight = Math.max(availableHeight * 0.8, 300);
    const gridHeight = Math.min(contentHeight * 0.6, isMobile ? 350 : 450);
    
    return {
      '--available-height': `${availableHeight}px`,
      '--safe-area-bottom': `${safeAreaBottom}px`,
      '--grid-max-height': `${gridHeight}px`,
      '--content-max-height': `${contentHeight}px`,
    } as React.CSSProperties;
  };

  return (
    <section 
      className={styles.instagramSection}
      style={getDynamicStyles()}
    >
      <div className={styles.sectionContent}>
        <header className={styles.sectionHeader}>
          <a 
            href={breweryInfo.social.instagram}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.instagramLink}
          >
            <h2 className={styles.sectionTitle}>Follow Us on Instagram</h2>
          </a>
          <p className={styles.sectionSubtitle}>@brokenloopbrewing - See the latest from our brewery!</p>
        </header>
        
        <div className={styles.instagramGrid}>
          {instagramImages.map((image, index) => (
            <a
              key={index}
              href={breweryInfo.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.instagramImageLink}
            >
              <img
                src={image}
                alt={`Instagram post ${index + 1}`}
                className={styles.instagramImage}
                loading="lazy"
              />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

export default InstagramSection; 