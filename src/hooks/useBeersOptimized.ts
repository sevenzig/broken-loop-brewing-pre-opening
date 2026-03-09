import { useState, useEffect } from 'react';

export interface Beer {
  slug: string;
  name: string;
  image: string;
  abv: string;
  style: string;
  brief_description: string;
  status: string;
  tapped_on?: string;
  ibu?: string;
  srm?: string;
  availability?: string;
  grain_bill?: string;
  hops?: string;
  malts?: string;
  yeast?: string;
  flavor_profile?: string;
  aroma?: string;
  appearance?: string;
  featured?: boolean;
  seasonal?: boolean;
  limited_edition?: boolean;
  barrel_aged?: boolean;
  content?: string;
}

export interface BeerStats {
  total: number;
  onTap: number;
  comingSoon: number;
  seasonal: number;
  archived: number;
  limitedEdition: number;
  retired: number;
}

/**
 * Optimized hook that uses pre-processed JSON data instead of runtime markdown processing
 * This eliminates the need for gray-matter, remark, and other heavy dependencies in the client bundle
 */
export function useBeersOptimized() {
  const [allBeers, setAllBeers] = useState<Beer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBeersData();
  }, []);

  const loadBeersData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/beers?limit=200');
      if (!response.ok) {
        throw new Error(`Failed to fetch beers: ${response.status}`);
      }
      
      const result = await response.json();
      const beers: Beer[] = result.beers ?? result;
      setAllBeers(beers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load beers');
      console.error('Error loading beers:', err);
    } finally {
      setLoading(false);
    }
  };

  // Memoized filtered beer lists
  const featuredOnTapBeers = getOnTapBeers(allBeers);
  const onTapBeers = getOnTapBeers(allBeers);
  const comingSoonBeers = filterBeersByStatus(allBeers, 'coming-soon');
  const seasonalBeers = filterBeersByStatus(allBeers, 'seasonal');
  const archivedBeers = filterBeersByStatus(allBeers, 'archived');
  const limitedEditionBeers = filterBeersByStatus(allBeers, 'limited-edition');
  const retiredBeers = filterBeersByStatus(allBeers, 'retired');
  
  const stats = getBeerStats(allBeers);

  return {
    // Data
    allBeers,
    featuredOnTapBeers,
    onTapBeers,
    comingSoonBeers,
    seasonalBeers,
    archivedBeers,
    limitedEditionBeers,
    retiredBeers,
    stats,
    
    // State
    loading,
    error,
    
    // Actions
    reload: loadBeersData
  };
}

/**
 * Optimized hook for getting a single beer by slug using pre-processed data
 */
export function useBeerOptimized(slug: string) {
  const [beer, setBeer] = useState<Beer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;

    const loadBeer = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/beers/${encodeURIComponent(slug)}`);
        if (response.status === 404) {
          setError(`Beer with slug "${slug}" not found`);
          setLoading(false);
          return;
        }
        if (!response.ok) {
          throw new Error(`Failed to fetch beer: ${response.status}`);
        }
        
        const result = await response.json();
        const foundBeer = result.beer ?? result;
        
        if (foundBeer) {
          setBeer(foundBeer);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load beer');
        console.error(`Error loading beer ${slug}:`, err);
      } finally {
        setLoading(false);
      }
    };

    loadBeer();
  }, [slug]);

  return {
    beer,
    loading,
    error
  };
}

/**
 * Optimized hook for filtering beers with custom criteria using pre-processed data
 */
export function useFilteredBeersOptimized(filterFn: (beer: Beer) => boolean) {
  const { allBeers, loading, error } = useBeersOptimized();
  const [filteredBeers, setFilteredBeers] = useState<Beer[]>([]);

  useEffect(() => {
    if (allBeers.length > 0 && filterFn) {
      const filtered = allBeers.filter(filterFn);
      setFilteredBeers(filtered);
    }
  }, [allBeers, filterFn]);

  return {
    beers: filteredBeers,
    loading,
    error,
    total: filteredBeers.length
  };
}

// Helper functions for beer filtering and stats
function getOnTapBeers(beers: Beer[]): Beer[] {
  return beers.filter(beer => beer.status === 'on-tap');
}

function filterBeersByStatus(beers: Beer[], status: string): Beer[] {
  return beers.filter(beer => beer.status === status);
}

function getBeerStats(beers: Beer[]): BeerStats {
  return {
    total: beers.length,
    onTap: beers.filter(b => b.status === 'on-tap').length,
    comingSoon: beers.filter(b => b.status === 'coming-soon').length,
    seasonal: beers.filter(b => b.status === 'seasonal').length,
    archived: beers.filter(b => b.status === 'archived').length,
    limitedEdition: beers.filter(b => b.status === 'limited-edition').length,
    retired: beers.filter(b => b.status === 'retired').length,
  };
}

