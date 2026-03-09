import { useState, useEffect, useMemo } from 'react';

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
  markdown?: string;
  uuid: string;
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

export function useOptimizedBeers() {
  const [allBeers, setAllBeers] = useState<Beer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBeers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/beers?limit=200');
      if (!response.ok) {
        throw new Error(`Failed to load beers: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      setAllBeers(result.beers ?? result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load beers';
      setError(errorMessage);
      console.error('Error loading beers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBeers();
  }, []);

  const featuredOnTapBeers = useMemo(() =>
    allBeers.filter(beer => beer.status === 'on-tap' && beer.featured),
    [allBeers]
  );

  const onTapBeers = useMemo(() =>
    allBeers.filter(beer => beer.status === 'on-tap'),
    [allBeers]
  );

  const comingSoonBeers = useMemo(() =>
    allBeers.filter(beer => beer.status === 'coming-soon'),
    [allBeers]
  );

  const seasonalBeers = useMemo(() =>
    allBeers.filter(beer => beer.status === 'seasonal'),
    [allBeers]
  );

  const archivedBeers = useMemo(() =>
    allBeers.filter(beer => beer.status === 'archived'),
    [allBeers]
  );

  const limitedEditionBeers = useMemo(() =>
    allBeers.filter(beer => beer.status === 'limited-edition'),
    [allBeers]
  );

  const retiredBeers = useMemo(() =>
    allBeers.filter(beer => beer.status === 'retired'),
    [allBeers]
  );

  const stats = useMemo<BeerStats>(() => ({
    total: allBeers.length,
    onTap: onTapBeers.length,
    comingSoon: comingSoonBeers.length,
    seasonal: seasonalBeers.length,
    archived: archivedBeers.length,
    limitedEdition: limitedEditionBeers.length,
    retired: retiredBeers.length,
  }), [allBeers, onTapBeers, comingSoonBeers, seasonalBeers, archivedBeers, limitedEditionBeers, retiredBeers]);

  return {
    allBeers,
    featuredOnTapBeers,
    onTapBeers,
    comingSoonBeers,
    seasonalBeers,
    archivedBeers,
    limitedEditionBeers,
    retiredBeers,
    stats,
    loading,
    error,
    reload: loadBeers,
  };
}

export function useOptimizedBeer(slug: string) {
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
        if (!response.ok) {
          if (response.status === 404) {
            setError('Beer not found');
          } else {
            throw new Error(`Failed to load beer: ${response.status}`);
          }
          return;
        }

        const result = await response.json();
        setBeer(result.beer ?? result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load beer');
        console.error('Error loading beer:', err);
      } finally {
        setLoading(false);
      }
    };

    loadBeer();
  }, [slug]);

  return { beer, loading, error };
}

export function useOptimizedFilteredBeers(filterFn: (beer: Beer) => boolean) {
  const { allBeers, loading, error } = useOptimizedBeers();

  const filteredBeers = useMemo(() =>
    allBeers.filter(filterFn),
    [allBeers, filterFn]
  );

  return {
    beers: filteredBeers,
    loading,
    error,
    total: filteredBeers.length,
  };
}
