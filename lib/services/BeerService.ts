import type { Beer, BeerFormData, BeerSearchParams, BeerListResponse, BeerResponse, BeerStats } from '../types/Beer';

export class BeerService {
  private beers: Beer[] = [];
  private initialized = false;
  private baseUrl: string;

  constructor() {
    // Use relative URL for both dev and production
    this.baseUrl = '/data';
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await this.loadBeers();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize BeerService:', error);
      throw error;
    }
  }

  private async loadBeers(): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/beers.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch beers: ${response.status}`);
      }
      
      const beersData = await response.json() as any[];
      
      // Extract just the frontmatter for the beers array
      this.beers = beersData.map((beerData: any) => {
        const { content, markdown, ...frontmatter } = beerData;
        return frontmatter;
      });
      
      console.log(`Loaded ${this.beers.length} beers from JSON`);
    } catch (error) {
      console.error('Failed to load beers:', error);
      this.beers = [];
    }
  }

  async getAllBeers(): Promise<Beer[]> {
    await this.initialize();
    return [...this.beers];
  }

  async getBeerByUUID(uuid: string): Promise<Beer | null> {
    await this.initialize();
    return this.beers.find(beer => beer.uuid === uuid) || null;
  }

  async getBeerBySlug(slug: string): Promise<Beer | null> {
    await this.initialize();
    return this.beers.find(beer => beer.slug === slug) || null;
  }

  async getBeerWithContent(uuid: string): Promise<BeerResponse | null> {
    await this.initialize();
    
    const beer = this.beers.find(b => b.uuid === uuid);
    if (!beer) return null;

    try {
      // Load from JSON
      const response = await fetch(`${this.baseUrl}/beers.json`);
      if (!response.ok) {
        throw new Error(`Failed to fetch beer content: ${response.status}`);
      }
      
      const beersData = await response.json() as any[];
      const beerData = beersData.find((b: any) => b.uuid === uuid);
      
      if (beerData) {
        return {
          beer,
          content: beerData.content,
          markdown: beerData.markdown
        };
      }
      return null;
    } catch (error) {
      console.error(`Failed to load content for beer ${uuid}:`, error);
      return null;
    }
  }

  async searchBeers(params: BeerSearchParams): Promise<BeerListResponse> {
    await this.initialize();
    
    let filteredBeers = [...this.beers];
    
    // Apply filters
    if (params.status) {
      filteredBeers = filteredBeers.filter(beer => beer.status === params.status);
    }
    
    if (params.style) {
      filteredBeers = filteredBeers.filter(beer => beer.style === params.style);
    }
    
    if (params.availability) {
      filteredBeers = filteredBeers.filter(beer => beer.availability === params.availability);
    }
    
    if (params.search) {
      const searchTerm = params.search.toLowerCase();
      filteredBeers = filteredBeers.filter(beer => 
        beer.name.toLowerCase().includes(searchTerm) ||
        beer.style.toLowerCase().includes(searchTerm) ||
        beer.brief_description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Apply sorting
    filteredBeers.sort((a, b) => {
      let aValue: any = a[params.sortBy as keyof Beer];
      let bValue: any = b[params.sortBy as keyof Beer];
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (params.sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      } else {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      }
    });
    
    // Apply pagination
    const total = filteredBeers.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBeers = filteredBeers.slice(startIndex, endIndex);
    
    return {
      beers: paginatedBeers,
      total,
      page,
      limit
    };
  }

  async getBeerStats(): Promise<BeerStats> {
    await this.initialize();
    
    const total = this.beers.length;
    const onTap = this.beers.filter(beer => beer.status === 'on-tap').length;
    const seasonal = this.beers.filter(beer => beer.status === 'seasonal').length;
    const comingSoon = this.beers.filter(beer => beer.status === 'coming-soon').length;
    const limitedEdition = this.beers.filter(beer => beer.status === 'limited-edition').length;
    const soldOut = this.beers.filter(beer => beer.status === 'sold-out').length;
    const archived = this.beers.filter(beer => beer.status === 'archived').length;
    const retired = this.beers.filter(beer => beer.status === 'retired').length;
    
    return {
      total,
      onTap,
      seasonal,
      comingSoon,
      limitedEdition,
      soldOut,
      archived,
      retired
    };
  }

  // Note: Create/Update/Delete operations are not supported in production
  // as we're now serving static JSON files
  async createBeer(_beerData: BeerFormData, _content: string): Promise<Beer> {
    throw new Error('Create operations not supported - data is read-only');
  }

  async updateBeer(_uuid: string, _beerData: Partial<BeerFormData>, _content?: string): Promise<Beer> {
    throw new Error('Update operations not supported - data is read-only');
  }

  async deleteBeer(_uuid: string): Promise<void> {
    throw new Error('Delete operations not supported - data is read-only');
  }

  async reloadBeers(): Promise<void> {
    this.initialized = false;
    await this.initialize();
  }
}
