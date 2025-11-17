export class BeerService {
    constructor() {
        this.beers = [];
        this.initialized = false;
        // Use relative URL for both dev and production
        this.baseUrl = '/data';
    }
    async initialize() {
        if (this.initialized)
            return;
        try {
            await this.loadBeers();
            this.initialized = true;
        }
        catch (error) {
            console.error('Failed to initialize BeerService:', error);
            throw error;
        }
    }
    async loadBeers() {
        try {
            const response = await fetch(`${this.baseUrl}/beers.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch beers: ${response.status}`);
            }
            const beersData = await response.json();
            // Extract just the frontmatter for the beers array
            this.beers = beersData.map((beerData) => {
                const { content, markdown, ...frontmatter } = beerData;
                return frontmatter;
            });
            console.log(`Loaded ${this.beers.length} beers from JSON`);
        }
        catch (error) {
            console.error('Failed to load beers:', error);
            this.beers = [];
        }
    }
    async getAllBeers() {
        await this.initialize();
        return [...this.beers];
    }
    async getBeerByUUID(uuid) {
        await this.initialize();
        return this.beers.find(beer => beer.uuid === uuid) || null;
    }
    async getBeerBySlug(slug) {
        await this.initialize();
        return this.beers.find(beer => beer.slug === slug) || null;
    }
    async getBeerWithContent(uuid) {
        await this.initialize();
        const beer = this.beers.find(b => b.uuid === uuid);
        if (!beer)
            return null;
        try {
            // Load from JSON
            const response = await fetch(`${this.baseUrl}/beers.json`);
            if (!response.ok) {
                throw new Error(`Failed to fetch beer content: ${response.status}`);
            }
            const beersData = await response.json();
            const beerData = beersData.find((b) => b.uuid === uuid);
            if (beerData) {
                return {
                    beer,
                    content: beerData.content,
                    markdown: beerData.markdown
                };
            }
            return null;
        }
        catch (error) {
            console.error(`Failed to load content for beer ${uuid}:`, error);
            return null;
        }
    }
    async searchBeers(params) {
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
            filteredBeers = filteredBeers.filter(beer => beer.name.toLowerCase().includes(searchTerm) ||
                beer.style.toLowerCase().includes(searchTerm) ||
                beer.brief_description.toLowerCase().includes(searchTerm));
        }
        // Apply sorting
        filteredBeers.sort((a, b) => {
            let aValue = a[params.sortBy];
            let bValue = b[params.sortBy];
            // Handle string comparison
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                aValue = aValue.toLowerCase();
                bValue = bValue.toLowerCase();
            }
            if (params.sortOrder === 'desc') {
                return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
            }
            else {
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
    async getBeerStats() {
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
    async createBeer(_beerData, _content) {
        throw new Error('Create operations not supported - data is read-only');
    }
    async updateBeer(_uuid, _beerData, _content) {
        throw new Error('Update operations not supported - data is read-only');
    }
    async deleteBeer(_uuid) {
        throw new Error('Delete operations not supported - data is read-only');
    }
    async reloadBeers() {
        this.initialized = false;
        await this.initialize();
    }
}
//# sourceMappingURL=BeerService.js.map