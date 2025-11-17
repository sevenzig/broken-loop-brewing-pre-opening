import { Link } from 'react-router-dom';
import { useStyleGuide } from '../hooks/useBeers';
import styles from './StyleGuidePage.module.css';

export function StyleGuidePage() {
  const { allStyles: beerStyles, loading, error } = useStyleGuide();

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading style guide...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>Error Loading Style Guide</h1>
          <p className={styles.errorMessage}>{error}</p>
          <Link to="/" className={styles.backLink}>
            ← Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Group styles by category
  const stylesByCategory = beerStyles.reduce((acc: Record<string, any[]>, style: any) => {
    const category = style.category_name || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(style);
    return acc;
  }, {} as Record<string, typeof beerStyles>);

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <nav className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbCurrent}>Beer Style Guide</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {/* Page Title */}
          <section className={styles.heroSection}>
            <div className={styles.heroContent}>
              <h1 className={styles.pageTitle}>BJCP Beer Style Guide</h1>
              <p className={styles.pageSubtitle}>
                Comprehensive guide to beer styles based on the Beer Judge Certification Program (BJCP) 2021 Guidelines
              </p>
              <p className={styles.statsText}>
                {beerStyles.length} beer styles across {Object.keys(stylesByCategory).length} categories
              </p>
            </div>
          </section>

          {/* Style Categories */}
          <section className={styles.categoriesSection}>
            {Object.entries(stylesByCategory).map(([categoryName, categoryStyles]) => (
              <div key={categoryName} className={styles.categoryGroup}>
                <h2 className={styles.categoryTitle}>{categoryName}</h2>
                <div className={styles.stylesGrid}>
                  {(categoryStyles as any[]).map((style: any) => (
                    <Link
                      key={style.style_code}
                      to={`/beers/style-guide/${style.style_code}-${style.style_name.toLowerCase().replace(/\s+/g, '-')}`}
                      className={styles.styleCard}
                    >
                      <div className={styles.styleCardContent}>
                        <h3 className={styles.styleName}>
                          {style.style_code}. {style.style_name}
                        </h3>
                        <p className={styles.styleDescription}>
                          {style.overall_impression?.substring(0, 150)}
                          {style.overall_impression && style.overall_impression.length > 150 ? '...' : ''}
                        </p>
                        {style.tags && style.tags.length > 0 && (
                          <div className={styles.styleTags}>
                            {style.tags.slice(0, 3).map((tag: string, index: number) => (
                              <span key={index} className={styles.tag}>
                                {tag}
                              </span>
                            ))}
                            {style.tags.length > 3 && (
                              <span className={styles.moreTags}>+{style.tags.length - 3} more</span>
                            )}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </div>
  );
}

export default StyleGuidePage;
