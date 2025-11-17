import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';

interface AgeVerificationSettings {
  enabled: boolean;
  lastUpdated: string;
  updatedBy: string;
}

// Global storage for age verification settings (persists across requests in the same function instance)
let globalAgeVerificationSettings: AgeVerificationSettings | null = null;

// Function to read age verification settings from environment variable or file
const readAgeVerificationSettings = (): AgeVerificationSettings => {
  // First check if we have a cached settings
  if (globalAgeVerificationSettings) {
    return globalAgeVerificationSettings;
  }
  
  // Check for environment variable override (set by admin)
  const envSettings = process.env.AGE_VERIFICATION_OVERRIDE;
  if (envSettings) {
    try {
      const parsedSettings = JSON.parse(envSettings);
      globalAgeVerificationSettings = parsedSettings;
      console.log('Using environment variable age verification settings:', parsedSettings);
      return parsedSettings;
    } catch (error) {
      console.warn('Could not parse AGE_VERIFICATION_OVERRIDE environment variable:', error);
    }
  }
  
  // Fall back to reading from file
  try {
    const filePath = path.join(process.cwd(), 'public/data/age-verification.json');
    if (fs.existsSync(filePath)) {
      const content = fs.readFileSync(filePath, 'utf8');
      const settings = JSON.parse(content);
      globalAgeVerificationSettings = settings;
      return settings;
    }
  } catch (error) {
    console.warn('Could not read age verification settings file:', error);
  }
  
  // Return default settings if nothing else works (enabled by default for legal compliance)
  const defaultSettings: AgeVerificationSettings = {
    enabled: true,
    lastUpdated: new Date().toISOString(),
    updatedBy: "system"
  };
  
  globalAgeVerificationSettings = defaultSettings;
  return defaultSettings;
};

// Function to update age verification settings (stores in global variable for this function instance)
const updateAgeVerificationSettings = (settings: AgeVerificationSettings): void => {
  // Store in global variable - this persists across requests in the same function instance
  globalAgeVerificationSettings = settings;
  console.log('Age verification settings updated globally:', settings);
  
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
      // Public endpoint - anyone can check age verification settings
      const settings = readAgeVerificationSettings();
      res.status(200).json({ success: true, data: settings });
      return;
    }

    if (req.method === 'POST') {
      // Parse request body
      const { enabled, updatedBy = 'admin' } = req.body;
      
      // Validate input
      if (typeof enabled !== 'boolean') {
        res.status(400).json({
          success: false,
          error: 'Invalid request: enabled must be a boolean'
        });
        return;
      }
      
      // Create updated settings
      const updatedSettings: AgeVerificationSettings = {
        enabled,
        lastUpdated: new Date().toISOString(),
        updatedBy
      };
      
      // Update the settings in memory and try to persist to file
      updateAgeVerificationSettings(updatedSettings);
      
      // Log the settings change for monitoring
      console.log(`Age verification settings change requested: ${enabled ? 'ENABLED' : 'DISABLED'} by ${updatedBy}`);
      
      // Return success response
      res.status(200).json({
        success: true,
        data: updatedSettings,
        message: `Age verification ${enabled ? 'enabled' : 'disabled'}`
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
    console.error('Age Verification Settings API Error:', error);
    
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
