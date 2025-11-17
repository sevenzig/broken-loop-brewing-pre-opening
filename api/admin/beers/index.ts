import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    try {
      // Read beer data directly
      const beersPath = path.join(process.cwd(), 'public/data/beers.json');
      let beers = [];
      
      try {
        const beersContent = fs.readFileSync(beersPath, 'utf8');
        beers = JSON.parse(beersContent);
      } catch (error) {
        console.warn('Could not load beers.json:', error);
        return res.status(500).json({
          success: false,
          error: 'Could not load beer data'
        });
      }

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

      // Convert to admin beer format
      let adminBeers = beers.map((beer: any) => ({
        id: beer.slug || beer.uuid,
        uuid: beer.uuid,
        name: beer.name,
        style: beer.style,
        abv: beer.abv,
        ibu: beer.ibu,
        status: beer.status || 'draft',
        availability: beer.availability || 'available',
        description: beer.brief_description || beer.description || '',
        imageUrl: beer.image || '',
        featured: beer.featured || false,
        created_at: beer.created_at || new Date().toISOString(),
        updated_at: beer.updated_at || new Date().toISOString(),
        markdown: '',
        filePath: `${beer.uuid || beer.slug}.md`,
        lastModified: beer.updated_at || new Date().toISOString()
      }));

      // Apply filters
      if (status) {
        adminBeers = adminBeers.filter((beer: any) => beer.status === status);
      }
      
      if (style) {
        adminBeers = adminBeers.filter((beer: any) => beer.style === style);
      }
      
      if (availability) {
        adminBeers = adminBeers.filter((beer: any) => beer.availability === availability);
      }
      
      if (search) {
        const searchTerm = (search as string).toLowerCase();
        adminBeers = adminBeers.filter((beer: any) => 
          beer.name.toLowerCase().includes(searchTerm) ||
          beer.style.toLowerCase().includes(searchTerm) ||
          (beer.description && beer.description.toLowerCase().includes(searchTerm))
        );
      }

      // Apply sorting
      adminBeers.sort((a: any, b: any) => {
        const aValue = a[sortBy as string];
        const bValue = b[sortBy as string];
        
        if (sortOrder === 'desc') {
          return aValue < bValue ? 1 : -1;
        } else {
          return aValue > bValue ? 1 : -1;
        }
      });

      // Apply pagination
      const pageNum = parseInt(page as string, 10);
      const limitNum = parseInt(limit as string, 10);
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      const paginatedBeers = adminBeers.slice(startIndex, endIndex);

      // Calculate stats
      const stats = {
        total: beers.length,
        onTap: beers.filter((beer: any) => beer.status === 'on-tap').length,
        seasonal: beers.filter((beer: any) => beer.status === 'seasonal').length,
        comingSoon: beers.filter((beer: any) => beer.status === 'coming-soon').length
      };

      res.status(200).json({
        success: true,
        data: {
          beers: paginatedBeers,
          total: adminBeers.length,
          page: pageNum,
          limit: limitNum,
          stats
        }
      });
    } catch (error) {
      console.error('Admin beers error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  } else if (req.method === 'POST') {
    // Redirect POST requests to the create endpoint
    res.status(301).json({ 
      success: false,
      error: 'Please use /api/admin/beers/create for creating new beers',
      redirect: '/api/admin/beers/create'
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}