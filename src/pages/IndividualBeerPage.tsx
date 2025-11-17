import { useParams, Link } from 'react-router-dom';
import { useOptimizedBeer } from '../hooks/useOptimizedBeers';
import BeerStyleTooltip from '../components/BeerStyleTooltip/BeerStyleTooltip';
import styles from './BeerDetailPage.module.css';

export function IndividualBeerPage() {
  const { slug } = useParams<{ slug: string }>();
  const { beer, loading, error } = useOptimizedBeer(slug || '');



  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading beer details...</p>
        </div>
      </div>
    );
  }

  if (error || !beer) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>Beer Not Found</h1>
          <p className={styles.errorMessage}>
            {error || `Sorry, we couldn't find a beer with the name "${slug}".`}
          </p>
          <Link to="/beer" className={styles.backLink}>
            ← Back to Beer Menu
          </Link>
        </div>
      </div>
    );
  }

  const getStatusBadge = () => {
    if (!beer.status) return null;
    
    const badgeClass = beer.status === 'on-tap' ? styles.onTapBadge : 
                      beer.status === 'seasonal' ? styles.seasonalBadge :
                      beer.status === 'coming-soon' ? styles.comingSoonBadge :
                      beer.status === 'limited-edition' ? styles.limitedBadge :
                      beer.status === 'retired' ? styles.retiredBadge :
                      styles.defaultBadge;

    return (
      <span className={badgeClass}>
        {beer.status.replace('-', ' ').toUpperCase()}
      </span>
    );
  };

  const getSrmColor = (srm: string | number) => {
    const srmNum = typeof srm === 'string' ? parseInt(srm) : srm;
    if (srmNum <= 5) return 'var(--srm-5)';
    if (srmNum > 40) return 'var(--srm-40)';
    return `var(--srm-${Math.round(srmNum)})`;
  };

  const getIbuColor = (ibu: string | number) => {
    const ibuNum = typeof ibu === 'string' ? parseInt(ibu) : ibu;
    if (ibuNum < 20) return 'var(--ibu-low)';
    if (ibuNum < 40) return 'var(--ibu-medium-low)';
    if (ibuNum < 60) return 'var(--ibu-medium)';
    if (ibuNum < 80) return 'var(--ibu-medium-high)';
    if (ibuNum < 100) return 'var(--ibu-high)';
    return 'var(--ibu-very-high)';
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <nav className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <Link to="/beer" className={styles.breadcrumbLink}>Beer Menu</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbCurrent}>{beer.name}</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {/* Beer Hero Section */}
          <section className={styles.heroSection}>
            <div className={styles.beerImageContainer}>
              <img 
                src={beer.image} 
                alt={beer.name}
                className={styles.beerImage}
              />

              {getStatusBadge()}
            </div>
            
            <div className={styles.beerInfo}>
              <h1 className={styles.beerTitle}>{beer.name}</h1>
              <p className={styles.beerStyle}>
                <BeerStyleTooltip styleName={beer.style}>
                  {beer.style}
                </BeerStyleTooltip>
              </p>
              <p className={styles.beerTagline}>{beer.brief_description}</p>
              
              {/* Beer Stats */}
              <div className={styles.beerStats}>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>ABV</span>
                  <span 
                    className={styles.statValue}
                    style={{ color: beer.srm ? getSrmColor(beer.srm) : 'inherit' }}
                  >
                    {beer.abv}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>IBU</span>
                  <span 
                    className={styles.statValue}
                    style={{ color: beer.ibu ? getIbuColor(beer.ibu) : 'inherit' }}
                  >
                    {beer.ibu}
                  </span>
                </div>
                <div className={styles.statItem}>
                  <span className={styles.statLabel}>SRM</span>
                  <span className={styles.statValue}>
                    {beer.srm}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Beer Details */}
          <section className={styles.detailsSection}>
            <div className={styles.detailsGrid}>
              {/* Full Description */}
              <div className={styles.descriptionCard}>
                <h2 className={styles.sectionTitle}>About This Beer</h2>
                <div 
                  className={styles.beerDescription}
                  dangerouslySetInnerHTML={{ __html: beer.content || '' }}
                />
              </div>

              {/* Tasting Notes & Brewing Details Combined */}
              <div className={styles.brewingCard}>
                {/* Tasting Notes first */}
                {(beer.flavor_profile || beer.aroma || beer.appearance) && (
                  <>
                    <h2 className={styles.sectionTitle}>Tasting Notes</h2>
                    <div className={styles.tastingNotes}>
                      {beer.flavor_profile && (
                        <div className={styles.tastingItem}>
                          <span className={styles.tastingLabel}>Flavor:</span>
                          <p className={styles.tastingValue}>{beer.flavor_profile}</p>
                        </div>
                      )}
                      {beer.aroma && (
                        <div className={styles.tastingItem}>
                          <span className={styles.tastingLabel}>Aroma:</span>
                          <p className={styles.tastingValue}>{beer.aroma}</p>
                        </div>
                      )}
                      {beer.appearance && (
                        <div className={styles.tastingItem}>
                          <span className={styles.tastingLabel}>Appearance:</span>
                          <p className={styles.tastingValue}>{beer.appearance}</p>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Brewing Details second */}
                <h2 className={styles.sectionTitle}>Brewing Details</h2>
                <div className={styles.brewingDetails}>
                  {beer.hops && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Hops:</span>
                      <span className={styles.detailValue}>{beer.hops}</span>
                    </div>
                  )}
                  {beer.malts && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Malts:</span>
                      <span className={styles.detailValue}>{beer.malts}</span>
                    </div>
                  )}
                  {beer.yeast && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Yeast:</span>
                      <span className={styles.detailValue}>{beer.yeast}</span>
                    </div>
                  )}
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Style:</span>
                    <span className={styles.detailValue}>
                      <BeerStyleTooltip styleName={beer.style}>
                        {beer.style}
                      </BeerStyleTooltip>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className={styles.ctaSection}>
            <div className={styles.ctaContainer}>
              <h2 className={styles.ctaTitle}>Ready to Try {beer.name}?</h2>
              <p className={styles.ctaText}>
                {beer.status === 'on-tap' 
                  ? "This beer is currently on tap and ready to enjoy!"
                  : beer.status === 'coming-soon'
                  ? "This beer is coming soon to our taps. Stay tuned!"
                  : "Visit us to see what's currently available on tap."
                }
              </p>
              <div className={styles.ctaButtons}>
                <Link to="/beer" className={styles.ctaButton}>
                  ← Back to Beer Menu
                </Link>
                <a href="#location" className={styles.ctaButtonSecondary}>
                  Visit Our Taproom
                  <span className={styles.ctaButtonIcon}>🍺</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
} 