import { useState } from 'react';
import { useOptimizedBeers } from '../hooks/useOptimizedBeers';
import { BeerCard } from '../components/BeerCard/BeerCard';
import styles from './BeerPage.module.css';
import type { Beer } from '../hooks/useOptimizedBeers';

type FilterType = 'all' | 'on-tap' | 'seasonal' | 'coming-soon' | 'limited-edition' | 'archive' | 'retired';

export function BeerPage() {
  const { 
    allBeers, 
    onTapBeers, 
    seasonalBeers, 
    comingSoonBeers, 
    limitedEditionBeers,
    archivedBeers,
    retiredBeers,
    loading, 
    error,
    stats 
  } = useOptimizedBeers();
  
  const [activeFilter, setActiveFilter] = useState<FilterType>('on-tap');

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <div className={styles.loadingState}>
            <h1>Loading Our Beer Selection...</h1>
            <p>Preparing our craft beer lineup for you</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <div className={styles.errorState}>
            <h1>Oops! Something Went Wrong</h1>
            <p>{error}</p>
            <p>Please try refreshing the page or check back later.</p>
          </div>
        </div>
      </div>
    );
  }

  const getFilteredBeers = (): Beer[] => {
    switch (activeFilter) {
      case 'on-tap':
        return onTapBeers;
      case 'seasonal':
        return seasonalBeers;
      case 'coming-soon':
        return comingSoonBeers;
      case 'limited-edition':
        return limitedEditionBeers;
      case 'archive':
        return archivedBeers;
      case 'retired':
        return retiredBeers;
      default:
        return allBeers;
    }
  };

  // For "All Beers" view, organize beers by category
  const getOrganizedAllBeers = () => {
    const onTapSet = new Set(onTapBeers.map(beer => beer.slug));
    const comingSoonSet = new Set(comingSoonBeers.map(beer => beer.slug));
    const seasonalSet = new Set(seasonalBeers.map(beer => beer.slug));
    const limitedSet = new Set(limitedEditionBeers.map(beer => beer.slug));
    const archivedSet = new Set(archivedBeers.map(beer => beer.slug));
    const retiredSet = new Set(retiredBeers.map(beer => beer.slug));

    return {
      onTap: onTapBeers,
      comingSoon: comingSoonBeers,
      seasonalAndLimited: allBeers.filter(beer => 
        (seasonalSet.has(beer.slug) || limitedSet.has(beer.slug)) && 
        !onTapSet.has(beer.slug) && 
        !comingSoonSet.has(beer.slug) &&
        !archivedSet.has(beer.slug) &&
        !retiredSet.has(beer.slug)
      ),
      archive: archivedBeers.filter(beer => 
        !onTapSet.has(beer.slug) && 
        !comingSoonSet.has(beer.slug) && 
        !seasonalSet.has(beer.slug) && 
        !limitedSet.has(beer.slug)
      ),
      retired: retiredBeers.filter(beer => 
        !onTapSet.has(beer.slug) && 
        !comingSoonSet.has(beer.slug) && 
        !seasonalSet.has(beer.slug) && 
        !limitedSet.has(beer.slug)
      )
    };
  };

  const filteredBeers = getFilteredBeers();
  const organizedBeers = activeFilter === 'all' ? getOrganizedAllBeers() : null;

  const filterButtons = [
    { key: 'all' as FilterType, label: 'All Beers', count: stats.total },
    { key: 'on-tap' as FilterType, label: 'On Tap', count: stats.onTap },
    { key: 'seasonal' as FilterType, label: 'Seasonal', count: stats.seasonal },
    { key: 'coming-soon' as FilterType, label: 'Coming Soon', count: stats.comingSoon },
    { key: 'limited-edition' as FilterType, label: 'Limited Edition', count: stats.limitedEdition },
    { key: 'archive' as FilterType, label: 'Archive', count: stats.archived },
    { key: 'retired' as FilterType, label: 'Retired', count: stats.retired },
  ];

  const renderBeerSection = (title: string, beers: Beer[], showOnTapBadge: boolean = false) => {
    if (beers.length === 0) return null;

    return (
      <div className={styles.categorySection}>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <div className={styles.beerGrid}>
          {beers.map((beer) => (
            <BeerCard
              key={beer.slug}
              beer={beer}
              showTappedDate={false}
              showOnTapBadge={showOnTapBadge}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageContent}>
        <header className={styles.pageHeader}>
          <h1 className={styles.pageTitle}>Our Craft Beer Selection</h1>
          <p className={styles.pageSubtitle}>
            Explore our carefully crafted beers, from hoppy IPAs to rich stouts
          </p>
        </header>

        <nav className={styles.filterNav}>
          <div className={styles.filterButtons}>
            {filterButtons.map(({ key, label, count }) => (
              <button
                key={key}
                className={`${styles.filterButton} ${
                  activeFilter === key ? styles.filterButtonActive : ''
                }`}
                onClick={() => setActiveFilter(key)}
                disabled={count === 0}
              >
                {label}
                {count > 0 && (
                  <span className={styles.filterCount}>{count}</span>
                )}
              </button>
            ))}
          </div>
        </nav>

        <section className={styles.beerSection}>
          {activeFilter === 'all' && organizedBeers ? (
            // Organized "All Beers" view
            <>
              {renderBeerSection('Currently On Tap', organizedBeers.onTap, true)}
              {renderBeerSection('Coming Soon', organizedBeers.comingSoon)}
              {renderBeerSection('Seasonal & Limited Edition', organizedBeers.seasonalAndLimited)}
              {renderBeerSection('Archive', organizedBeers.archive)}
              {renderBeerSection('Retired Favorites', organizedBeers.retired)}
            </>
          ) : (
            // Single category view
            filteredBeers.length > 0 ? (
              <>
                <div className={styles.sectionInfo}>
                  <h2 className={styles.sectionTitle}>
                    {filterButtons.find(f => f.key === activeFilter)?.label}
                  </h2>
                  <p className={styles.resultsCount}>
                    {filteredBeers.length} beer{filteredBeers.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                <div className={styles.beerGrid}>
                  {filteredBeers.map((beer) => (
                    <BeerCard
                      key={beer.slug}
                      beer={beer}
                      showTappedDate={activeFilter === 'on-tap'}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>No Beers Found</h3>
                <p>
                  {activeFilter === 'all' 
                    ? "We're working on our beer selection. Check back soon!"
                    : `No ${filterButtons.find(f => f.key === activeFilter)?.label.toLowerCase()} available right now.`
                  }
                </p>
                {activeFilter !== 'all' && (
                  <button 
                    className={styles.resetButton}
                    onClick={() => setActiveFilter('all')}
                  >
                    View All Beers
                  </button>
                )}
              </div>
            )
          )}
        </section>
      </div>
    </div>
  );
} 