import type { VercelResponse } from '@vercel/node';
import { AdminService } from './lib/services/AdminService';
import { requireAuth, type AuthenticatedRequest } from './lib/auth/middleware';

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
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method === 'GET') {
      // Get sync status
      const status = await adminService.getSyncStatus();
      const githubInfo = await adminService.getGitHubInfo();
      
      res.status(200).json({
        sync: status,
        github: githubInfo
      });
    } else if (req.method === 'POST') {
      // Trigger sync to GitHub
      try {
        await adminService.syncToGitHub();
        
        res.status(200).json({
          success: true,
          message: 'Sync completed successfully'
        });
      } catch (error) {
        console.error('Sync failed:', error);
        
        res.status(500).json({
          success: false,
          error: error instanceof Error ? error.message : 'Sync failed'
        });
      }
    } else {
      res.setHeader('Allow', ['GET', 'POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Sync API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('GitHub service not configured')) {
        res.status(400).json({ error: 'GitHub integration not configured' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Export protected handler with required permissions
export default requireAuth(protectedHandler, ['admin:access', 'sync:github']);
