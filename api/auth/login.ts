/**
 * Login API Endpoint
 * Simplified version for production reliability
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';

// Hardcoded admin credentials for production reliability
const ADMIN_USERNAME = 'admin-001';
const ADMIN_PASSWORD = 'admin123'; // In production, this should be properly hashed

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    username: string;
    role: string;
    permissions: string[];
    lastLogin: string;
  };
  error?: string;
  code?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
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

    // Validate request body
    if (!req.body || typeof req.body !== 'object') {
      res.status(400).json({
        success: false,
        error: 'Invalid request body',
        code: 'INVALID_REQUEST'
      } as LoginResponse);
      return;
    }

    const { username, password } = req.body as LoginCredentials;

    // Validate credentials format
    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      res.status(400).json({
        success: false,
        error: 'Username and password are required',
        code: 'MISSING_CREDENTIALS'
      } as LoginResponse);
      return;
    }

    // Simple credential check
    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      res.status(401).json({
        success: false,
        error: 'Invalid credentials',
        code: 'INVALID_CREDENTIALS'
      } as LoginResponse);
      return;
    }

    // Create simple token (in production, use proper JWT)
    const token = 'simple-token-' + Date.now();

    // Return success response
    res.status(200).json({
      success: true,
      token,
      user: {
        id: 'admin-001',
        username: ADMIN_USERNAME,
        role: 'admin',
        permissions: ['read', 'write', 'delete'],
        lastLogin: new Date().toISOString()
      }
    } as LoginResponse);

  } catch (error) {
    console.error('Login API error:', error);
    
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      code: 'INTERNAL_ERROR'
    } as LoginResponse);
  }
}

