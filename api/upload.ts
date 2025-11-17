import type { VercelResponse } from '@vercel/node';
import formidable from 'formidable';
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

// Disable formidable's default body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

const protectedHandler = async (req: AuthenticatedRequest, res: VercelResponse) => {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method === 'POST') {
      // Parse multipart form data
      const form = formidable({
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowEmptyFiles: false,
        filter: (part) => {
          // Only allow image files
          return part.mimetype?.startsWith('image/') || false;
        }
      });

      const [, files] = await form.parse(req);
      
      const uploadedFiles = files.file || files.image || [];
      
      if (uploadedFiles.length === 0) {
        res.status(400).json({ error: 'No image file provided' });
        return;
      }

      const file = uploadedFiles[0];
      
      if (!file) {
        res.status(400).json({ error: 'Invalid file upload' });
        return;
      }

      // Upload the file
      const result = await adminService.uploadImage(file);
      
      if (result.success) {
        res.status(200).json({
          success: true,
          filePath: result.filePath,
          message: 'File uploaded successfully'
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error
        });
      }
    } else {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('Upload API Error:', error);
    
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        res.status(413).json({ error: 'File too large. Maximum size is 5MB.' });
      } else if (error.message.includes('Invalid file type')) {
        res.status(400).json({ error: 'Invalid file type. Only images are allowed.' });
      } else {
        res.status(500).json({ error: 'Internal server error' });
      }
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};

// Export protected handler with required permissions
export default requireAuth(protectedHandler, ['admin:access', 'upload:files']);
