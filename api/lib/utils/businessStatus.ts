export interface BusinessStatus {
  isOpen: boolean;
  lastUpdated: string;
  updatedBy: string;
}

// In-memory store for business status (resets on serverless function restart)
let businessStatusCache: BusinessStatus | null = null;

// Read current business status from file or cache
export const readBusinessStatus = (): BusinessStatus => {
  // Return cached status if available
  if (businessStatusCache) {
    return businessStatusCache;
  }

  try {
    // Use proper ES module imports for Node.js
    const { readFileSync } = require('fs');
    const { join } = require('path');
    
    // Determine the correct path based on environment
    const businessStatusPath = join(process.cwd(), 'public', 'data', 'business-status.json');
    
    console.log(`Reading business status from: ${businessStatusPath}`);
    const businessStatusData = JSON.parse(readFileSync(businessStatusPath, 'utf8'));
    console.log(`Successfully loaded business status:`, businessStatusData);
    
    businessStatusCache = businessStatusData;
    return businessStatusData;
  } catch (error) {
    console.warn('Could not read business-status.json, using default:', error);
    // Return default status if file doesn't exist or is invalid
    const defaultStatus: BusinessStatus = {
      isOpen: true,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'system'
    };
    businessStatusCache = defaultStatus;
    return defaultStatus;
  }
};

// Update business status in cache (and optionally file in development)
export const updateBusinessStatus = (status: BusinessStatus): void => {
  // Update cache
  businessStatusCache = status;
  
  // In development, try to write to file
  if (process.env.NODE_ENV === 'development') {
    try {
      const { writeFileSync } = require('fs');
      const { join } = require('path');
      const businessStatusPath = join(process.cwd(), 'public', 'data', 'business-status.json');
      writeFileSync(businessStatusPath, JSON.stringify(status, null, 2), 'utf8');
      console.log('Business status updated successfully in development:', status);
    } catch (error) {
      console.warn('Could not write business status to file in development:', error);
      // Continue anyway - cache is updated
    }
  }
  
  console.log('Business status updated in cache:', status);
};
