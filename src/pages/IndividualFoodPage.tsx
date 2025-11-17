import { useParams, Link } from 'react-router-dom';
import { useFoodItem } from '../hooks/useFood';
import styles from './FoodDetailPage.module.css';

function IndividualFoodPage() {
  const { slug } = useParams<{ slug: string }>();
  const { foodItem, loading, error } = useFoodItem(slug || '');



  if (loading) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>Loading food details...</p>
        </div>
      </div>
    );
  }

  if (error || !foodItem) {
    return (
      <div className={styles.pageContainer}>
        <div className={styles.errorContainer}>
          <h1 className={styles.errorTitle}>Food Item Not Found</h1>
          <p className={styles.errorMessage}>
            {error || `Sorry, we couldn't find a food item with the name "${slug}".`}
          </p>
          <Link to="/food" className={styles.backLink}>
            ← Back to Food Menu
          </Link>
        </div>
      </div>
    );
  }

  const getSpiceLevelIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'mild': return '🌶️';
      case 'medium': return '🌶️🌶️';
      case 'hot': return '🌶️🌶️🌶️';
      default: return '🌶️';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'specials': return 'Chef\'s Special';
      case 'appetizers': return 'Appetizer';
      case 'mains': return 'Main Course';
      case 'sides': return 'Side Dish';
      default: return category;
    }
  };

  const getCategoryBadge = () => {
    const badgeClass = foodItem.category === 'specials' ? styles.specialBadge : 
                      foodItem.category === 'appetizers' ? styles.appetizerBadge :
                      foodItem.category === 'mains' ? styles.mainBadge :
                      foodItem.category === 'sides' ? styles.sideBadge :
                      styles.defaultBadge;

    return (
      <span className={badgeClass}>
        {getCategoryLabel(foodItem.category)}
      </span>
    );
  };

  return (
    <div className={styles.pageContainer}>
      {/* Header */}
      <header className={styles.pageHeader}>
        <div className={styles.headerContent}>
          <nav className={styles.breadcrumb}>
            <Link to="/" className={styles.breadcrumbLink}>Home</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <Link to="/food" className={styles.breadcrumbLink}>Food Menu</Link>
            <span className={styles.breadcrumbSeparator}>→</span>
            <span className={styles.breadcrumbCurrent}>{foodItem.name}</span>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <div className={styles.contentContainer}>
          {/* Food Hero Section */}
          <section className={styles.heroSection}>
            <div className={styles.foodImageContainer}>
              <img 
                src="/images/logo_square_lg.jpg"
                alt={foodItem.name}
                className={styles.foodImage}
              />

              {getCategoryBadge()}
              {!foodItem.available && (
                <span className={styles.unavailableBadge}>Sold Out</span>
              )}
            </div>
            
            <div className={styles.foodInfo}>
              <h1 className={styles.foodTitle}>{foodItem.name}</h1>
              <p className={styles.foodPrice}>{foodItem.price}</p>
              <p className={styles.foodTagline}>{foodItem.brief_description}</p>
              
              {/* Food Stats */}
              <div className={styles.foodStats}>
                {foodItem.spice_level && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Spice Level</span>
                    <span className={styles.statValue}>
                      {foodItem.spice_level && getSpiceLevelIcon(foodItem.spice_level)} {foodItem.spice_level}
                    </span>
                  </div>
                )}
                {foodItem.dietary_notes && (
                  <div className={styles.statItem}>
                    <span className={styles.statLabel}>Dietary Notes</span>
                    <span className={styles.statValue}>{foodItem.dietary_notes}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* Food Details */}
          <section className={styles.detailsSection}>
            <div className={styles.detailsGrid}>
              {/* Full Description */}
              <div className={styles.descriptionCard}>
                <h2 className={styles.sectionTitle}>About This Dish</h2>
                <div 
                  className={styles.foodDescription}
                  dangerouslySetInnerHTML={{ __html: foodItem.content || '' }}
                />
              </div>

              {/* Ingredients & Details */}
              <div className={styles.ingredientsCard}>
                <h2 className={styles.sectionTitle}>Ingredients & Details</h2>
                <div className={styles.ingredientsDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Main Ingredients:</span>
                    <span className={styles.detailValue}>{foodItem.ingredients}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Preparation Time:</span>
                    <span className={styles.detailValue}>{foodItem.prep_time}</span>
                  </div>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Spice Level:</span>
                    <span className={styles.detailValue}>
                      {foodItem.spice_level && getSpiceLevelIcon(foodItem.spice_level)} {foodItem.spice_level}
                    </span>
                  </div>
                  {foodItem.dietary_notes && (
                    <div className={styles.detailItem}>
                      <span className={styles.detailLabel}>Dietary Information:</span>
                      <span className={styles.detailValue}>{foodItem.dietary_notes}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className={styles.ctaSection}>
            <div className={styles.ctaContainer}>
              <h2 className={styles.ctaTitle}>Ready to Order {foodItem.name}?</h2>
              <p className={styles.ctaText}>
                {foodItem.available !== false
                  ? "This delicious dish is available now. Come taste the BBQ difference!"
                  : "This item is currently sold out. Check back soon or try one of our other amazing dishes!"
                }
              </p>
              <div className={styles.ctaButtons}>
                <Link to="/food" className={styles.ctaButton}>
                  ← Back to Food Menu
                </Link>
                <a href="tel:+1234567890" className={styles.ctaButtonSecondary}>
                  Call to Order
                  <span className={styles.ctaButtonIcon}>📞</span>
                </a>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

export default IndividualFoodPage; 