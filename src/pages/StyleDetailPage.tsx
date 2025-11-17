import { useParams, Link } from 'react-router-dom';
import { useStyleByCode } from '../hooks/useBeers';
import styles from './StyleDetailPage.module.css';

export function StyleDetailPage() {
  const { styleCode } = useParams<{ styleCode: string }>();
  const { style, loading, error } = useStyleByCode(styleCode || '');

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading style details...</p>
        </div>
      </div>
    );
  }

  if (error || !style) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>Style Not Found</h1>
          <p className={styles.errorMessage}>
            {error || `Sorry, we couldn't find the style "${styleCode}".`}
          </p>
          <Link to="/beers/style-guide" className={styles.backLink}>
            ← Back to Style Guide
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <nav className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <Link to="/beers/style-guide" className={styles.breadcrumbLink}>Style Guide</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbCurrent}>{style.style_name}</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {/* Style Header */}
          <section className={styles.styleHeader}>
            <div className={styles.styleHeaderContent}>
              <div className={styles.styleCode}>{style.style_code}</div>
              <h1 className={styles.styleTitle}>{style.style_name}</h1>
              <p className={styles.styleCategory}>{style.category_name}</p>
              {style.tags && style.tags.length > 0 && (
                <div className={styles.styleTags}>
                  {style.tags.map((tag, index) => (
                    <span key={index} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Style Content */}
          <section className={styles.styleContent}>
            <div className={styles.contentGrid}>
              {/* Main Content */}
              <div className={styles.mainContent}>
                {/* Overall Impression */}
                {style.overall_impression && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Overall Impression</h2>
                    <p className={styles.sectionContent}>{style.overall_impression}</p>
                  </div>
                )}

                {/* Aroma */}
                {style.aroma && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Aroma</h2>
                    <p className={styles.sectionContent}>{style.aroma}</p>
                  </div>
                )}

                {/* Appearance */}
                {style.appearance && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Appearance</h2>
                    <p className={styles.sectionContent}>{style.appearance}</p>
                  </div>
                )}

                {/* Flavor */}
                {style.flavor && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Flavor</h2>
                    <p className={styles.sectionContent}>{style.flavor}</p>
                  </div>
                )}

                {/* Mouthfeel */}
                {style.mouthfeel && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Mouthfeel</h2>
                    <p className={styles.sectionContent}>{style.mouthfeel}</p>
                  </div>
                )}

                {/* Comments */}
                {style.comments && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Comments</h2>
                    <p className={styles.sectionContent}>{style.comments}</p>
                  </div>
                )}

                {/* History */}
                {style.history && (
                  <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>History</h2>
                    <p className={styles.sectionContent}>{style.history}</p>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className={styles.sidebar}>
                {/* Vital Statistics */}
                {style.vital_stats && (
                  <div className={styles.sidebarSection}>
                    <h3 className={styles.sidebarTitle}>Vital Statistics</h3>
                    <div className={styles.statsGrid}>
                      {style.vital_stats.og && (
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>OG:</span>
                          <span className={styles.statValue}>{style.vital_stats.og}</span>
                        </div>
                      )}
                      {style.vital_stats.fg && (
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>FG:</span>
                          <span className={styles.statValue}>{style.vital_stats.fg}</span>
                        </div>
                      )}
                      {style.vital_stats.ibu && (
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>IBUs:</span>
                          <span className={styles.statValue}>{style.vital_stats.ibu}</span>
                        </div>
                      )}
                      {style.vital_stats.srm && (
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>SRM:</span>
                          <span className={styles.statValue}>{style.vital_stats.srm}</span>
                        </div>
                      )}
                      {style.vital_stats.abv && (
                        <div className={styles.statItem}>
                          <span className={styles.statLabel}>ABV:</span>
                          <span className={styles.statValue}>{style.vital_stats.abv}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Commercial Examples */}
                {style.commercial_examples && (
                  <div className={styles.sidebarSection}>
                    <h3 className={styles.sidebarTitle}>Commercial Examples</h3>
                    <div className={styles.examplesList}>
                      {Object.entries(style.commercial_examples).map(([region, examples]) => (
                        <div key={region} className={styles.exampleGroup}>
                          <h4 className={styles.exampleRegion}>{region.charAt(0).toUpperCase() + region.slice(1)}</h4>
                          <ul className={styles.exampleItems}>
                            {examples.map((example, index) => (
                              <li key={index} className={styles.exampleItem}>{example}</li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation */}
                <div className={styles.sidebarSection}>
                  <h3 className={styles.sidebarTitle}>Navigation</h3>
                  <Link to="/beers/style-guide" className={styles.navLink}>
                    ← Back to Style Guide
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default StyleDetailPage;
