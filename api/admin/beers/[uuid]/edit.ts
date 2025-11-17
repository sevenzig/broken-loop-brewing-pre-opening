import type { VercelResponse } from '@vercel/node';
import { AdminService } from '../../../lib/services/AdminService';
import { requireAuth, type AuthenticatedRequest } from '../../../lib/auth/middleware';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const { uuid } = req.query;

    if (!uuid || typeof uuid !== 'string') {
      res.status(400).json({ error: 'UUID parameter is required' });
      return;
    }

    if (req.method === 'GET') {
      const result = await adminService.getBeerForEdit(uuid);
      
      if (!result) {
        res.status(404).json({ error: 'Beer not found' });
        return;
      }

      res.status(200).json(result);
    } else if (req.method === 'PUT') {
      // Validate content type
      if (!req.headers['content-type']?.includes('application/json')) {
        res.status(400).json({ error: 'Content-Type must be application/json' });
        return;
      }

      const { beer, content } = req.body;

      if (!beer) {
        res.status(400).json({ error: 'Beer data is required' });
        return;
      }

      const updatedBeer = await adminService.updateBeer(uuid, beer, content);
      
      res.status(200).json({ beer: updatedBeer });
    } else {
      res.setHeader('Allow', ['GET', 'PUT']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Admin Edit API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        res.status(400).json({ error: error.message });
      } else if (error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
      } else if (error.message.includes('already exists')) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Export protected handler with required permissions
export default requireAuth(protectedHandler, ['admin:access', 'beer:read', 'beer:update']);
