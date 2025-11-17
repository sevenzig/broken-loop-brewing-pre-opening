/**
 * Token Refresh API Endpoint
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

    // Extract current token
    const authHeader = req.headers.authorization;
    const currentToken = authHeader?.replace('Bearer ', '');
    
    if (!currentToken) {
      res.status(401).json({
        success: false,
        error: 'Authorization token required',
        code: 'MISSING_TOKEN',
        timestamp: Date.now()
      });
      return;
    }

    // Simple token validation - in production, validate properly
    if (!currentToken.startsWith('simple-token-')) {
      res.status(401).json({
        success: false,
        error: 'Token expired or invalid',
        code: 'TOKEN_EXPIRED',
        timestamp: Date.now()
      });
      return;
    }

    // Generate new token
    const newToken = 'simple-token-' + Date.now();

    // Return refreshed token
    res.status(200).json({
      success: true,
      token: newToken,
      refreshed: true,
      timestamp: Date.now()
    });

  } catch (error) {
    console.error('Token refresh API error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
      timestamp: Date.now()
    });
  }
}

