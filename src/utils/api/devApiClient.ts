/**
 * Development API Client
 * 
 * This client provides real data from local files during development
 * instead of using mock data, so the admin panel can work properly
 * in development mode.
 */

import { breweryInfo } from '../../data/breweryInfo';

interface BusinessStatusResponse {
  success: boolean;
  status: {
    isOpen: boolean;
    lastUpdated: string;
    updatedBy: string;
  };
  error?: string;
  message?: string;
}

// Business status from local data
export const getBusinessStatus = async (): Promise<BusinessStatusResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  console.log('Development API Client: Getting business status from local data');
  
  // Check for admin override in localStorage first
  const adminOverride = localStorage.getItem('dev_business_status');
  if (adminOverride) {
    try {
      const overrideStatus = JSON.parse(adminOverride);
      console.log('Development API Client: Using admin override status:', overrideStatus);
      return {
        success: true,
        status: overrideStatus
      };
    } catch (error) {
      console.error('Development API Client: Error parsing admin override:', error);
    }
  }
  
  // Try to read from the business-status.json file first
  try {
    const response = await fetch('/data/business-status.json');
    if (response.ok) {
      const fileStatus = await response.json();
      console.log('Development API Client: Using file-based status:', fileStatus);
      return {
        success: true,
        status: fileStatus
      };
    }
  } catch (error) {
    console.warn('Development API Client: Could not read business-status.json:', error);
  }
  
  // Fall back to business hours if no admin override and no file
  const status = breweryInfo.getCurrentStatus();
  return {
    success: true,
    status: {
      isOpen: status.isOpen,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'development'
    }
  };
};

// Update business status (writes to local storage for development)
export const updateBusinessStatus = async (isOpen: boolean): Promise<BusinessStatusResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Store in localStorage for development persistence
  const status = {
    isOpen,
    lastUpdated: new Date().toISOString(),
    updatedBy: 'development'
  };
  
  localStorage.setItem('dev_business_status', JSON.stringify(status));
  
  return {
    success: true,
    status,
    message: `Business status updated to ${isOpen ? 'OPEN' : 'CLOSED'}`
  };
};

// Clear business status override (returns to business hours)
export const clearBusinessStatusOverride = async (): Promise<BusinessStatusResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 100));
  
  // Remove the override from localStorage
  localStorage.removeItem('dev_business_status');
  
  // Get the current status from business hours
  const status = breweryInfo.getCurrentStatus();
  
  return {
    success: true,
    status: {
      isOpen: status.isOpen,
      lastUpdated: new Date().toISOString(),
      updatedBy: 'development'
    },
    message: 'Business status override cleared, returning to business hours'
  };
};

// Get beers from local data
export const getBeers = async () => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  
  try {
    console.log('Development API Client: Loading real beers from local data files');
    
    // Load the real beer data from the JSON file (same as useOptimizedBeers)
    const response = await fetch('/data/beers.json');
    if (!response.ok) {
      throw new Error(`Failed to load beers: ${response.status} ${response.statusText}`);
    }
    
    const beers = await response.json();
    
    // Transform the beer data to match the expected format
    const transformedBeers = beers.map((beer: any) => ({
      uuid: beer.uuid || `beer-${beer.name.toLowerCase().replace(/\s+/g, '-')}`,
      name: beer.name,
      style: beer.style || 'Unknown',
      status: beer.status || 'on_tap',
      abv: beer.abv || '0%',
      ibu: beer.ibu || '0',
      brief_description: beer.brief_description || beer.description || 'No description available',
      created_at: beer.created_at || new Date().toISOString(),
      updated_at: beer.updated_at || new Date().toISOString()
    }));
    
    console.log('Development API Client: Loaded', transformedBeers.length, 'real beers');
    
    return {
      success: true,
      data: transformedBeers,
      total: transformedBeers.length,
      page: 1,
      limit: transformedBeers.length
    };
  } catch (error) {
    console.error('Error loading beers in development:', error);
    return {
      success: false,
      error: 'Failed to load beers',
      data: []
    };
  }
};

// Metadata is now generated directly in components from beer data
// No separate metadata API needed - use admin APIs instead

// Development API client now uses proper admin APIs only
