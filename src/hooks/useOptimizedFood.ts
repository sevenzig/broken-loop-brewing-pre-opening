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
  content?: string;
  markdown?: string;
  uuid: string;
}

export function useOptimizedFood() {
  const [allFood, setAllFood] = useState<Food[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadFood = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/food?limit=200');
      if (!response.ok) {
        throw new Error(`Failed to load food: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setAllFood(result.food ?? result);
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

export function useOptimizedFoodItem(slug: string) {
  const [foodItem, setFoodItem] = useState<Food | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadFoodItem = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/food/${encodeURIComponent(slug)}`);
        if (!response.ok) {
          if (response.status === 404) {
            setError('Food item not found');
          } else {
            throw new Error(`Failed to load food item: ${response.status}`);
          }
          return;
        }

        const result = await response.json();
        setFoodItem(result.food ?? result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load food item');
        console.error('Error loading food item:', err);
      } finally {
        setLoading(false);
      }
    };

    loadFoodItem();
  }, [slug]);

  return { foodItem, loading, error };
}

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
