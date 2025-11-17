import { Link } from 'react-router-dom';
import styles from './BeerCard.module.css';
import type { Beer } from '../../hooks/useOptimizedBeers';

interface BeerCardProps {
  beer: Beer;
  showTappedDate?: boolean;
  showOnTapBadge?: boolean;
}

export function BeerCard({ beer, showTappedDate = false, showOnTapBadge = false }: BeerCardProps) {
  if (!beer) return null;

  const getCardClass = () => {
    let baseClass = styles.card;
    
    if (beer.status === 'retired') {
      baseClass += ` ${styles.retired}`;
    } else if (beer.status === 'archived') {
      baseClass += ` ${styles.archived}`;
    }
    
    return baseClass;
  };

  const cardClass = getCardClass();

  const formatTappedDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getSrmColor = (srm: string | number) => {
    const srmNum = typeof srm === 'string' ? parseInt(srm) : srm;
    if (srmNum <= 5) return 'var(--srm-5)';
    if (srmNum > 40) return 'var(--srm-40)';
    return `var(--srm-${Math.round(srmNum)})`;
  };

  return (
    <Link 
      to={`/beers/${beer.slug}`} 
      className={styles.cardLink}
      aria-label={`View details for ${beer.name}`}
    >
      <article className={cardClass}>
        <div className={styles.imageContainer}>
          <img 
            src={beer.image} 
            alt={beer.name}
            className={styles.beerImage}
            loading="lazy"
          />
          {beer.barrel_aged ? (
            <span className={styles.barrelAgedBadge}>Barrel Aged</span>
          ) : (
            <>
              {beer.status === 'limited-edition' && (
                <span className={styles.limitedBadge}>Limited</span>
              )}
              {beer.status === 'retired' && (
                <span className={styles.retiredBadge}>Retired</span>
              )}
              {showOnTapBadge && (
                <span className={styles.onTapBadge}>On Tap</span>
              )}
            </>
          )}
        </div>
        
        <div className={styles.content}>
          <header className={styles.cardHeader}>
            <h3 className={styles.beerName}>{beer.name}</h3>
          </header>

          {/* Style on its own line */}
          <p className={styles.beerStyle}>{beer.style}</p>

          {/* Stats on one line */}
          <div className={styles.beerStats}>
            <span className={styles.abv}>{beer.abv} ABV</span>
            {beer.ibu && (
              <span className={styles.ibu}>{beer.ibu} IBU</span>
            )}
            {beer.srm && (
              <span className={styles.srm}>
                <span 
                  className={styles.srmSquare}
                  style={{ backgroundColor: getSrmColor(beer.srm) }}
                ></span>
                {beer.srm} SRM
              </span>
            )}
          </div>
          
          <p className={styles.description}>
            {beer.brief_description}
          </p>

          {showTappedDate && beer.tapped_on && (
            <div className={styles.tappedInfo}>
              <span className={styles.tappedLabel}>Tapped:</span>
              <span className={styles.tappedDate}>
                {formatTappedDate(beer.tapped_on)}
              </span>
            </div>
          )}
        </div>
      </article>
    </Link>
  );
} 