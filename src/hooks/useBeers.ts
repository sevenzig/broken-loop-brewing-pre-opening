/**
 * Compatibility layer for existing useBeers hook
 * Delegates to optimized hooks that use pre-processed JSON data
 * This eliminates runtime markdown processing dependencies
 */

import { 
  useOptimizedBeers,
  useOptimizedBeer,
  useOptimizedFilteredBeers,
  type Beer
} from './useOptimizedBeers';

import { 
  useOptimizedBeerStyles,
  useOptimizedBeerStyle,
  useOptimizedBeerStyleByName,
  type BeerStyleInfo
} from './useOptimizedBeerStyles';

// Re-export optimized hooks with original names for backward compatibility
export const useBeers = useOptimizedBeers;
export const useBeer = useOptimizedBeer;
export const useFilteredBeers = useOptimizedFilteredBeers;
export const useAllStyles = useOptimizedBeerStyles;
export const useStyleByCode = useOptimizedBeerStyle;
export const useStyleByName = useOptimizedBeerStyleByName;
export const useStyleGuide = useOptimizedBeerStyles;

// Re-export types
export type { Beer, BeerStyleInfo };