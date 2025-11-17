/**
 * Logout API Endpoint
 * Simplified version for production reliability
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
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

    if (req.method !== 'POST') {
      res.setHeader('Allow', ['POST']);
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    // Simple logout - just return success
    // In a real implementation, you would invalidate the token in a database
    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Logout API error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      timestamp: Date.now()
    });
  }
}

