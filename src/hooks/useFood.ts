/**
 * Compatibility layer for existing useFood hook
 * Delegates to optimized hooks that use pre-processed JSON data
 */

import { 
  useOptimizedFood,
  useOptimizedFoodItem,
  useOptimizedFilteredFood,
  type Food
} from './useOptimizedFood';

// Re-export optimized hooks with original names for backward compatibility
export const useFood = useOptimizedFood;
export const useFoodItem = useOptimizedFoodItem;
export const useFilteredFood = useOptimizedFilteredFood;

// Re-export types
export type { Food };