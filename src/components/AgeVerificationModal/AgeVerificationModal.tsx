import React, { useMemo } from 'react';
import styles from './AgeVerificationModal.module.css';

interface AgeVerificationModalProps {
  onVerify: (isOfAge: boolean) => void;
}

const BubbleAnimation = () => {
  const bubbles = useMemo(() => Array.from({ length: 200 }, (_, i) => ({
    id: i,
    size: Math.random() * 5 + 1, // 1-6px bubbles for more variety
    left: Math.random() * 100,
    duration: Math.random() * 4 + 3, // 3-7 seconds
    delay: Math.random() * 2, // Random delay for more natural effect
    opacity: Math.min(1.0, (Math.random() * 0.6 + 0.6) * 1.5) // Increased opacity
  })), []);

  return (
    <div className={styles.bubbleContainer}>
      {bubbles.map(bubble => (
        <div
          key={bubble.id}
          className={styles.bubble}
          style={{
            '--bubble-size': `${bubble.size}px`,
            '--bubble-left': `${bubble.left}%`,
            '--bubble-duration': `${bubble.duration}s`,
            '--bubble-delay': `${bubble.delay}s`,
            '--bubble-opacity': bubble.opacity
          } as React.CSSProperties}
        />
      ))}
    </div>
  );
};

const AgeVerificationModal: React.FC<AgeVerificationModalProps> = ({ onVerify }) => {
  const handleYes = () => {
    onVerify(true);
  };

  const handleNo = () => {
    onVerify(false);
  };

  return (
    <div className={styles.overlay}>
      <BubbleAnimation />
      <div className={styles.modal}>
        <div className={styles.logoSection}>
          <img 
            src="/images/logo_square.jpg" 
            alt="Broken Loop Brewing Logo" 
            className={styles.logo}
          />
          <h1 className={styles.breweryName}>Broken Loop Brewing</h1>
        </div>
        
        <div className={styles.content}>
          <h2 className={styles.title}>Age Verification Required</h2>
          <p className={styles.message}>
            You must be 21 years or older to enter this website.
          </p>
          <p className={styles.subMessage}>
            By entering this website, you affirm that you are of legal drinking 
            age in the location where you are accessing this website.
          </p>
        </div>
        
        <div className={styles.buttonContainer}>
          <button 
            className={styles.yesButton}
            onClick={handleYes}
            type="button"
          >
            I AM 21 OR OLDER
          </button>
          <button 
            className={styles.noButton}
            onClick={handleNo}
            type="button"
          >
            I AM UNDER 21
          </button>
        </div>
        
        <div className={styles.footer}>
          <p className={styles.disclaimer}>
            By entering this website, you affirm that you are of legal drinking 
            age in the location where you are accessing this website.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AgeVerificationModal; 