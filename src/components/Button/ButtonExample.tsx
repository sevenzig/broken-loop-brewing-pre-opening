import { useState } from 'react';
import { Button } from './Button';
import styles from './ButtonExample.module.css';

export function ButtonExample() {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleClick = (variant: string) => {
    console.log(`${variant} button clicked`);
  };

  const handleLoadingClick = (buttonId: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }));
    
    // Simulate loading for 3 seconds
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonId]: false }));
    }, 3000);
  };

  return (
    <div className={styles.container}>
      <h2>Button Variants</h2>
      

      
      <div className={styles.section}>
        <h3>Loading Buttons (Test)</h3>
        <div className={styles.buttonGroup}>
          <Button 
            variant="primary" 
            loading={loadingStates['loading-primary']}
            onClick={() => handleLoadingClick('loading-primary')}
          >
            {loadingStates['loading-primary'] ? 'Loading...' : 'Loading Primary'}
          </Button>
          <Button 
            variant="secondary" 
            loading={loadingStates['loading-secondary']}
            onClick={() => handleLoadingClick('loading-secondary')}
          >
            {loadingStates['loading-secondary'] ? 'Loading...' : 'Loading Secondary'}
          </Button>
          <Button 
            variant="tertiary" 
            loading={loadingStates['loading-tertiary']}
            onClick={() => handleLoadingClick('loading-tertiary')}
          >
            {loadingStates['loading-tertiary'] ? 'Loading...' : 'Loading Tertiary'}
          </Button>
          <Button 
            variant="transparent" 
            loading={loadingStates['loading-transparent']}
            onClick={() => handleLoadingClick('loading-transparent')}
          >
            {loadingStates['loading-transparent'] ? 'Loading...' : 'Loading Transparent'}
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Primary Buttons</h3>
        <div className={styles.buttonGroup}>
          <Button variant="primary" size="small" onClick={() => handleClick('primary-small')}>
            Small Primary
          </Button>
          <Button variant="primary" size="medium" onClick={() => handleClick('primary-medium')}>
            Medium Primary
          </Button>
          <Button variant="primary" size="large" onClick={() => handleClick('primary-large')}>
            Large Primary
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Secondary Buttons</h3>
        <div className={styles.buttonGroup}>
          <Button variant="secondary" size="small" onClick={() => handleClick('secondary-small')}>
            Small Secondary
          </Button>
          <Button variant="secondary" size="medium" onClick={() => handleClick('secondary-medium')}>
            Medium Secondary
          </Button>
          <Button variant="secondary" size="large" onClick={() => handleClick('secondary-large')}>
            Large Secondary
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Tertiary Buttons (Order/Secondary Color)</h3>
        <div className={styles.buttonGroup}>
          <Button variant="tertiary" size="small" onClick={() => handleClick('tertiary-small')}>
            Small Tertiary
          </Button>
          <Button variant="tertiary" size="medium" onClick={() => handleClick('tertiary-medium')}>
            Medium Tertiary
          </Button>
          <Button variant="tertiary" size="large" onClick={() => handleClick('tertiary-large')}>
            Large Tertiary
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Transparent Buttons</h3>
        <div className={styles.buttonGroup}>
          <Button variant="transparent" size="small" onClick={() => handleClick('transparent-small')}>
            Small Transparent
          </Button>
          <Button variant="transparent" size="medium" onClick={() => handleClick('transparent-medium')}>
            Medium Transparent
          </Button>
          <Button variant="transparent" size="large" onClick={() => handleClick('transparent-large')}>
            Large Transparent
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Full Width Buttons</h3>
        <div className={styles.fullWidthGroup}>
          <Button variant="primary" fullWidth onClick={() => handleClick('full-width-primary')}>
            Full Width Primary
          </Button>
          <Button variant="secondary" fullWidth onClick={() => handleClick('full-width-secondary')}>
            Full Width Secondary
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Link Buttons</h3>
        <div className={styles.buttonGroup}>
          <Button variant="primary" href="/beers" target="_blank">
            View Beers
          </Button>
          <Button variant="secondary" href="/events">
            View Events
          </Button>
          <Button variant="tertiary" href="/food">
            View Food
          </Button>
        </div>
      </div>

      <div className={styles.section}>
        <h3>Disabled Buttons</h3>
        <div className={styles.buttonGroup}>
          <Button variant="primary" disabled onClick={() => handleClick('disabled')}>
            Disabled Primary
          </Button>
          <Button variant="secondary" disabled onClick={() => handleClick('disabled')}>
            Disabled Secondary
          </Button>
          <Button variant="tertiary" disabled onClick={() => handleClick('disabled')}>
            Disabled Tertiary
          </Button>
        </div>
      </div>
    </div>
  );
} 