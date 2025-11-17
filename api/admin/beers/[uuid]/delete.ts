import type { VercelRequest, VercelResponse } from '@vercel/node';
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
    res.setHeader('Access-Control-Allow-Methods', 'DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const { uuid } = req.query;

    if (!uuid || typeof uuid !== 'string') {
      res.status(400).json({ 
        success: false,
        error: 'UUID parameter is required' 
      });
      return;
    }

    if (req.method === 'DELETE') {
      // Check if beer exists before attempting deletion
      const existingBeer = await adminService.getBeerForEdit(uuid);
      if (!existingBeer) {
        res.status(404).json({ 
          success: false,
          error: 'Beer not found' 
        });
        return;
      }

      await adminService.deleteBeer(uuid);
      
      res.status(200).json({ 
        success: true,
        message: 'Beer deleted successfully' 
      });
    } else {
      res.setHeader('Allow', ['DELETE', 'OPTIONS']);
      res.status(405).json({ 
        success: false,
        error: `Method ${req.method} Not Allowed` 
      });
    }
  } catch (error) {
    console.error('Admin Delete Beer API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('not found')) {
        res.status(404).json({ 
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
export default requireAuth(protectedHandler, ['admin:access', 'beer:delete']);
