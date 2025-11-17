import type { Beer, BeerFormData, BeerSearchParams, BeerListResponse, BeerResponse, BeerStats } from '../types/Beer';
export declare class BeerService {
    private beers;
    private initialized;
    private baseUrl;
    constructor();
    initialize(): Promise<void>;
    private loadBeers;
    getAllBeers(): Promise<Beer[]>;
    getBeerByUUID(uuid: string): Promise<Beer | null>;
    getBeerBySlug(slug: string): Promise<Beer | null>;
    getBeerWithContent(uuid: string): Promise<BeerResponse | null>;
    searchBeers(params: BeerSearchParams): Promise<BeerListResponse>;
    getBeerStats(): Promise<BeerStats>;
    createBeer(_beerData: BeerFormData, _content: string): Promise<Beer>;
    updateBeer(_uuid: string, _beerData: Partial<BeerFormData>, _content?: string): Promise<Beer>;
    deleteBeer(_uuid: string): Promise<void>;
    reloadBeers(): Promise<void>;
}
//# sourceMappingURL=BeerService.d.ts.map