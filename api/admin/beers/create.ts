import type { VercelRequest, VercelResponse } from '@vercel/node';
import { AdminService } from '../../lib/services/AdminService';
import { requireAuth, type AuthenticatedRequest } from '../../lib/auth/middleware';

// Initialize admin service with GitHub config if available
const adminService = new AdminService(
  'src/data/beers',
  'public/uploads',
  process.env.GITHUB_TOKEN ? {
    token: process.env.GITHUB_TOKEN,
    owner: process.env.GITHUB_OWNER || '',
    repo: process.env.GITHUB_REPO || '',
    branch: process.env.GITHUB_BRANCH || 'main',
    contentPath: process.env.CONTENT_PATH || 'src/data/beers'
  } : undefined
);

const protectedHandler = async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method === 'POST') {
      // Validate content type
      if (!req.headers['content-type']?.includes('application/json')) {
        res.status(400).json({ 
          success: false,
          error: 'Content-Type must be application/json' 
        });
        return;
      }

      const { beer, content } = req.body;

      if (!beer) {
        res.status(400).json({ 
          success: false,
          error: 'Beer data is required' 
        });
        return;
      }

      // Validate required fields
      const requiredFields = ['name', 'style', 'abv', 'ibu'];
      const missingFields = requiredFields.filter(field => !beer[field]);
      
      if (missingFields.length > 0) {
        res.status(400).json({ 
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}` 
        });
        return;
      }

      // Validate data types
      if (typeof beer.abv !== 'number' || beer.abv < 0 || beer.abv > 20) {
        res.status(400).json({ 
          success: false,
          error: 'ABV must be a number between 0 and 20' 
        });
        return;
      }

      if (typeof beer.ibu !== 'number' || beer.ibu < 0 || beer.ibu > 120) {
        res.status(400).json({ 
          success: false,
          error: 'IBU must be a number between 0 and 120' 
        });
        return;
      }

      const newBeer = await adminService.createBeer(beer, content || '');
      
      res.status(201).json({ 
        success: true,
        data: { beer: newBeer }
      });
    } else {
      res.setHeader('Allow', ['POST', 'OPTIONS']);
      res.status(405).json({ 
        success: false,
        error: `Method ${req.method} Not Allowed` 
      });
    }
  } catch (error) {
    console.error('Admin Create Beer API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        res.status(400).json({ 
          success: false,
          error: error.message 
        });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ 
          success: false,
          error: error.message 
        });
      } else {
        res.status(500).json({ 
          success: false,
          error: 'Internal server error',
          message: error.message 
        });
      }
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
};

// Export protected handler with required permissions
export default requireAuth(protectedHandler, ['admin:access', 'beer:create']);
