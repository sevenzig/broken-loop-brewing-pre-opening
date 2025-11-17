import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useFood } from '../hooks/useFood';
import { FoodCard } from '../components/FoodCard/FoodCard';
import styles from './FoodPage.module.css';
import type { Food } from '../hooks/useOptimizedFood';

type FilterType = 'all' | 'specials' | 'starters' | 'mains' | 'sides' | 'drinks';

function FoodPage() {
  const { 
    allFood,
    specials, 
    appetizers, 
    mains, 
    sides, 
    loading, 
    error,
    stats
  } = useFood();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Mock drinks data since it wasn't in the original structure
  const drinks = [
    {
      name: "House Craft Beer",
      brief_description: "Rotating selection of our finest brews",
      price: "$6-8",
      slug: "craft-beer",
      category: "drinks",
      available: true,
      featured: false,
      image: "/images/placeholder-drink.jpg",
      ingredients: "Malt, hops, yeast, water",
      prep_time: "Ready to serve",
      spice_level: "",
      uuid: "craft-beer"
    },
    {
      name: "Local Wine Selection",
      brief_description: "Curated wines from regional vineyards",
      price: "$8-12",
      slug: "local-wine",
      category: "drinks",
      available: true,
      featured: false,
      image: "/images/placeholder-drink.jpg",
      ingredients: "Grapes, natural additives",
      prep_time: "Ready to serve",
      spice_level: "",
      uuid: "local-wine"
    },
    {
      name: "Fresh Iced Tea",
      brief_description: "Sweet tea brewed fresh daily",
      price: "$3",
      slug: "iced-tea",
      category: "drinks",
      available: true,
      featured: false,
      image: "/images/placeholder-drink.jpg",
      ingredients: "Black tea, sugar, lemon",
      prep_time: "2 mins",
      spice_level: "",
      uuid: "iced-tea"
    }
  ];

  // Handle URL parameters for filtering
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam && ['all', 'specials', 'starters', 'mains', 'sides', 'drinks'].includes(filterParam)) {
      setActiveFilter(filterParam as FilterType);
    }
  }, [searchParams]);

  // Update URL when filter changes
  const handleFilterChange = (filter: FilterType) => {
    setActiveFilter(filter);
    if (filter === 'all') {
      setSearchParams({});
    } else {
      setSearchParams({ filter });
    }
  };

  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.pageContent}>
          <div className={styles.loadingState}>
            <h1>Loading Our Delicious Menu...</h1>
            <p>Preparing our food selection for you</p>
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

  const getFilteredFood = (): Food[] => {
    switch (activeFilter) {
      case 'specials':
        return specials;
      case 'starters':
        return appetizers;
      case 'mains':
        return mains;
      case 'sides':
        return sides;
      case 'drinks':
        return drinks;
      default:
        return [...allFood, ...drinks];
    }
  };

  // For "All" view, organize food by category
  const getOrganizedAllFood = () => {
    return {
      specials: specials,
      starters: appetizers,
      mains: mains,
      sides: sides,
      drinks: drinks
    };
  };

  const filteredFood = getFilteredFood();
  const organizedFood = activeFilter === 'all' ? getOrganizedAllFood() : null;

  const filterButtons = [
    { key: 'all' as FilterType, label: 'Full Menu', count: allFood.length + drinks.length },
    { key: 'specials' as FilterType, label: 'Specials', count: stats.specials },
    { key: 'starters' as FilterType, label: 'Starters', count: stats.appetizers },
    { key: 'mains' as FilterType, label: 'Mains', count: stats.mains },
    { key: 'sides' as FilterType, label: 'Sides', count: stats.sides },
    { key: 'drinks' as FilterType, label: 'Drinks', count: drinks.length },
  ];

  const renderFoodSection = (title: string, foodItems: Food[]) => {
    if (foodItems.length === 0) return null;

    return (
      <div className={styles.categorySection}>
        <h3 className={styles.categoryTitle}>{title}</h3>
        <div className={styles.foodGrid}>
          {foodItems.map((food) => (
            <FoodCard
              key={food.slug}
              food={food}
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
          <h1 className={styles.pageTitle}>Barbeque Smokehouse</h1>
          <p className={styles.pageSubtitle}>
            Authentic BBQ made with love, smoked low and slow to perfection. 
            Every dish is crafted to pair perfectly with our craft beers.
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
                onClick={() => handleFilterChange(key)}
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

        <section className={styles.foodSection}>
          {activeFilter === 'all' && organizedFood ? (
            // Organized "All Food" view
            <>
              {renderFoodSection('Chef\'s Specials', organizedFood.specials)}
              {renderFoodSection('Starters', organizedFood.starters)}
              {renderFoodSection('Main Dishes', organizedFood.mains)}
              {renderFoodSection('Sides', organizedFood.sides)}
              {renderFoodSection('Drinks', organizedFood.drinks)}
            </>
          ) : (
            // Single category view
            filteredFood.length > 0 ? (
              <>
                <div className={styles.sectionInfo}>
                  <h2 className={styles.sectionTitle}>
                    {filterButtons.find(f => f.key === activeFilter)?.label}
                  </h2>
                  <p className={styles.resultsCount}>
                    {filteredFood.length} item{filteredFood.length !== 1 ? 's' : ''} found
                  </p>
                </div>
                
                <div className={styles.foodGrid}>
                  {filteredFood.map((food) => (
                                      <FoodCard
                    key={food.slug}
                    food={food}
                  />
                  ))}
                </div>
              </>
            ) : (
              <div className={styles.emptyState}>
                <h3>No Items Found</h3>
                <p>
                  {activeFilter === 'all' 
                    ? "We're working on our menu. Check back soon!"
                    : `No ${filterButtons.find(f => f.key === activeFilter)?.label.toLowerCase()} available right now.`
                  }
                </p>
                {activeFilter !== 'all' && (
                  <button 
                    className={styles.resetButton}
                    onClick={() => handleFilterChange('all')}
                  >
                    View Full Menu
                  </button>
                )}
              </div>
            )
          )}
        </section>

        {/* Call to Action */}
        <section className={styles.ctaSection}>
          <div className={styles.ctaContainer}>
            <h2 className={styles.ctaTitle}>Ready to Order?</h2>
            <p className={styles.ctaText}>
              Come taste the difference that slow-smoked BBQ makes. 
              Our kitchen is open and ready to serve you!
            </p>
            <div className={styles.ctaButtons}>
              <a href="tel:+1234567890" className={styles.ctaButton}>
                Call to Order
                <span className={styles.ctaButtonIcon}>📞</span>
              </a>
              <a href="#location" className={styles.ctaButtonSecondary}>
                Visit Us
                <span className={styles.ctaButtonIcon}>📍</span>
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

export default FoodPage; 