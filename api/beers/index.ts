import type { VercelRequest, VercelResponse } from '@vercel/node';

// Hardcoded beers data for production reliability
const BEERS_DATA = [
  {
    "name": "Bavarian Cloud Hefeweizen",
    "image": "/images/beers-test/Hefeweizen.jpg",
    "slug": "bavarian-cloud-hefeweizen",
    "abv": "5.4%",
    "ibu": "12",
    "srm": "4",
    "style": "German Hefeweizen",
    "status": "coming-soon",
    "availability": "Summer",
    "featured": false,
    "brief_description": "Traditional German wheat beer with notes of banana and clove, naturally cloudy with a smooth, refreshing finish."
  },
  {
    "name": "Hoppy Trails IPA",
    "image": "/images/beers-test/IPA.jpg",
    "slug": "hoppy-trails-ipa",
    "abv": "6.8%",
    "ibu": "65",
    "srm": "6",
    "style": "American IPA",
    "status": "on-tap",
    "availability": "Year-round",
    "featured": true,
    "brief_description": "Bold American IPA with citrus and pine hop flavors, balanced by a solid malt backbone."
  },
  {
    "name": "Midnight Stout",
    "image": "/images/beers-test/Stout.jpg",
    "slug": "midnight-stout",
    "abv": "7.2%",
    "ibu": "35",
    "srm": "35",
    "style": "American Stout",
    "status": "on-tap",
    "availability": "Winter",
    "featured": true,
    "brief_description": "Rich, dark stout with notes of coffee, chocolate, and roasted barley."
  },
  {
    "name": "Golden Wheat",
    "image": "/images/beers-test/Wheat.jpg",
    "slug": "golden-wheat",
    "abv": "4.8%",
    "ibu": "18",
    "srm": "3",
    "style": "American Wheat",
    "status": "on-tap",
    "availability": "Spring/Summer",
    "featured": false,
    "brief_description": "Light and refreshing wheat beer with subtle citrus notes, perfect for warm weather."
  }
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method === 'GET') {
      // Parse query parameters
      const {
        status,
        style,
        availability,
        search,
        page = '1',
        limit = '50',
        sortBy = 'name',
        sortOrder = 'asc'
      } = req.query;

      let filteredBeers = [...BEERS_DATA];
      
      // Apply filters
      if (status) {
        filteredBeers = filteredBeers.filter((beer: any) => beer.status === status);
      }
      
      if (style) {
        filteredBeers = filteredBeers.filter((beer: any) => beer.style === style);
      }
      
      if (availability) {
        filteredBeers = filteredBeers.filter((beer: any) => beer.availability === availability);
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        filteredBeers = filteredBeers.filter((beer: any) => 
          beer.name.toLowerCase().includes(searchTerm) ||
          beer.style.toLowerCase().includes(searchTerm) ||
          beer.brief_description.toLowerCase().includes(searchTerm)
        );
      }
      
      // Apply sorting
      filteredBeers.sort((a: any, b: any) => {
        let aValue: any = a[sortBy as string];
        let bValue: any = b[sortBy as string];
        
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (sortOrder === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        } else {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }
      });
      
      // Apply pagination
      const total = filteredBeers.length;
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedBeers = filteredBeers.slice(startIndex, endIndex);
      
      const result = {
        beers: paginatedBeers,
        total,
        page: pageNum,
        limit: limitNum
      };
      
      res.status(200).json(result);
    } else {
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
