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
    filePath?: string;
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
 * Load and process all beer markdown files
 * Uses Vite's import.meta.glob for build-time processing
 */
export declare function loadAllBeers(): Promise<Beer[]>;
/**
 * Clear the beer cache (useful for development)
 */
export declare function clearBeerCache(): void;
/**
 * Load a single beer by slug
 */
export declare function loadBeerBySlug(slug: string): Promise<Beer | undefined>;
/**
 * Filter beers by status
 */
export declare function filterBeersByStatus(beers: Beer[], status: string): Beer[];
/**
 * Get all on-tap beers
 */
export declare function getOnTapBeers(beers: Beer[]): Beer[];
/**
 * Get beer statistics
 */
export declare function getBeerStats(beers: Beer[]): BeerStats;
