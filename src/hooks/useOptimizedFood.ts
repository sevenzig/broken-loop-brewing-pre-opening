import { useState, useEffect, useMemo } from 'react';

export interface Food {
  slug: string;
  name: string;
  image: string;
  price: string;
  brief_description: string;
  category: string;
  ingredients?: string;
  prep_time?: string;
  spice_level?: string;
  dietary_notes?: string;
  available?: boolean;
  featured?: boolean;
  seasonal?: boolean;
  content?: string; // Pre-processed HTML content
  markdown?: string; // Original markdown for admin editing
  uuid: string;
}

/**
 * Optimized hook that uses pre-processed JSON data instead of runtime markdown processing
 * This eliminates gray-matter, remark, and remark-html from the client bundle
 */
export function useOptimizedFood() {
  const [allFood, setAllFood] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFood = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/data/food.json');
      if (!response.ok) {
        throw new Error(`Failed to load food: ${response.status} ${response.statusText}`);
      }
      
      const foodData = await response.json();
      setAllFood(foodData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load food';
      setError(errorMessage);
      console.error('Error loading food:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFood();
  }, []);

  // Memoized filtered food arrays for performance
  const featuredFood = useMemo(() => 
    allFood.filter(food => food.featured), 
    [allFood]
  );

  const appetizers = useMemo(() => 
    allFood.filter(food => food.category === 'appetizers'), 
    [allFood]
  );

  const mains = useMemo(() => 
    allFood.filter(food => food.category === 'mains'), 
    [allFood]
  );

  const sides = useMemo(() => 
    allFood.filter(food => food.category === 'sides'), 
    [allFood]
  );

  const specials = useMemo(() => 
    allFood.filter(food => food.category === 'specials'), 
    [allFood]
  );

  const seasonalFood = useMemo(() => 
    allFood.filter(food => food.seasonal), 
    [allFood]
  );

  // Food statistics
  const stats = useMemo(() => ({
    total: allFood.length,
    featured: featuredFood.length,
    appetizers: appetizers.length,
    mains: mains.length,
    sides: sides.length,
    specials: specials.length,
    seasonal: seasonalFood.length,
    available: allFood.filter(food => food.available !== false).length,
  }), [allFood, featuredFood, appetizers, mains, sides, specials, seasonalFood]);

  return {
    allFood,
    featuredFood,
    appetizers,
    mains,
    sides,
    specials,
    seasonalFood,
    stats,
    loading,
    error,
    reload: loadFood,
  };
}

/**
 * Optimized hook for getting a single food item by slug using pre-processed data
 */
export function useOptimizedFoodItem(slug: string) {
  const { allFood, loading, error } = useOptimizedFood();

  const foodItem = useMemo(() => 
    allFood.find(food => food.slug === slug) || null, 
    [allFood, slug]
  );

  return {
    foodItem,
    loading,
    error,
  };
}

/**
 * Optimized hook for filtering food with custom criteria using pre-processed data
 */
export function useOptimizedFilteredFood(filterFn: (food: Food) => boolean) {
  const { allFood, loading, error } = useOptimizedFood();

  const filteredFood = useMemo(() => 
    allFood.filter(filterFn), 
    [allFood, filterFn]
  );

  return {
    food: filteredFood,
    loading,
    error,
    total: filteredFood.length,
  };
}
