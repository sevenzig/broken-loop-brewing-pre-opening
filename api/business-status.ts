import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

interface BusinessStatus {
  isOpen: boolean;
  lastUpdated: string;
  updatedBy: string;
}

// Global storage for business status (persists across requests in the same function instance)
let globalBusinessStatus: BusinessStatus | null = null;

// Function to read business status from environment variable or file
const readBusinessStatus = (): BusinessStatus => {
  // First check if we have a cached status
  if (globalBusinessStatus) {
    return globalBusinessStatus;
  }
  
  // Check for environment variable override (set by admin)
  const envStatus = process.env.BUSINESS_STATUS_OVERRIDE;
  if (envStatus) {
    try {
      const parsedStatus = JSON.parse(envStatus);
      globalBusinessStatus = parsedStatus;
      console.log('Using environment variable business status:', parsedStatus);
      return parsedStatus;
    } catch (error) {
      console.warn('Could not parse BUSINESS_STATUS_OVERRIDE environment variable:', error);
    }
  }
  
  // Fall back to reading from file
  try {
    const filePath = path.join(process.cwd(), 'public/data/business-status.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const status = JSON.parse(content);
      globalBusinessStatus = status;
      return status;
    }
  } catch (error) {
    console.warn('Could not read business status file:', error);
  }
  
  // Return default status if nothing else works (business closed by default)
  const defaultStatus: BusinessStatus = {
    isOpen: false,
    lastUpdated: new Date().toISOString(),
    updatedBy: "system"
  };
  
  globalBusinessStatus = defaultStatus;
  return defaultStatus;
};

// Function to update business status (stores in global variable for this function instance)
const updateBusinessStatus = (status: BusinessStatus): void => {
  // Store in global variable - this persists across requests in the same function instance
  globalBusinessStatus = status;
  console.log('Business status updated globally:', status);
  
  // Note: In a real production environment, you would want to use:
  // - Vercel KV for persistent key-value storage
  // - A database like Supabase, PlanetScale, etc.
  // - Redis for caching
  // For now, this will work within the same function instance
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
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
      // Public endpoint - anyone can check business status
      const status = readBusinessStatus();
      res.status(200).json({ success: true, data: status });
      return;
    }

    if (req.method === 'POST') {
      // Parse request body
      const { isOpen, updatedBy = 'admin' } = req.body;
      
      // Validate input
      if (typeof isOpen !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Invalid request: isOpen must be a boolean'
        });
        return;
      }
      
      // Create updated status
      const updatedStatus: BusinessStatus = {
        isOpen,
        lastUpdated: new Date().toISOString(),
        updatedBy
      };
      
      // Update the status in memory and try to persist to file
      updateBusinessStatus(updatedStatus);
      
      // Log the status change for monitoring
      console.log(`Business status change requested: ${isOpen ? 'OPEN' : 'CLOSED'} by ${updatedBy}`);
      
      // Return success response
      res.status(200).json({
        success: true,
        data: updatedStatus,
        message: `Business status updated to ${isOpen ? 'open' : 'closed'}`
      });
      return;
    }

    // Method not allowed
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).json({ 
      success: false, 
      error: `Method ${req.method} Not Allowed` 
    });
    
  } catch (error) {
    console.error('Business Status API Error:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ 
        success: false,
        error: error.message 
      });
    } else {
      res.status(500).json({ 
        success: false,
        error: 'Internal server error' 
      });
    }
  }
}
