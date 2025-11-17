import { Link } from 'react-router-dom';
import styles from './FoodCard.module.css';
import type { Food } from '../../hooks/useOptimizedFood';

interface FoodCardProps {
  food: Food;
  showCategory?: boolean;
}

export function FoodCard({ food, showCategory = false }: FoodCardProps) {
  if (!food) return null;

  const cardClass = styles.card;

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'specials': return 'Chef\'s Special';
      case 'appetizers': return 'Appetizer';
      case 'mains': return 'Main Course';
      case 'sides': return 'Side Dish';
      case 'drinks': return 'Beverage';
      default: return category;
    }
  };

  return (
    <article className={cardClass}>
      <div className={styles.imageContainer}>
        <img 
          src="/images/logo_square_lg.jpg"
          alt={food.name}
          className={styles.foodImage}
          loading="lazy"
        />
        {food.category === 'specials' && (
          <span className={styles.specialBadge}>Special</span>
        )}
        {food.available === false && (
          <span className={styles.unavailableBadge}>Sold Out</span>
        )}
      </div>
      
      <div className={styles.content}>
        <header className={styles.cardHeader}>
          <h3 className={styles.foodName}>{food.name}</h3>
          <div className={styles.foodMeta}>
            <span className={styles.price}>{food.price}</span>
            {showCategory && (
              <span className={styles.category}>{getCategoryLabel(food.category)}</span>
            )}
          </div>
        </header>
        
        <p className={styles.description}>
          {food.brief_description}
        </p>

        <footer className={styles.cardFooter}>
          <Link 
            to={`/food/${food.slug}`} 
            className={styles.detailsLink}
            aria-label={`Learn more about ${food.name}`}
          >
            View Details
            <span className={styles.linkArrow} aria-hidden="true">→</span>
          </Link>
        </footer>
      </div>
    </article>
  );
} 