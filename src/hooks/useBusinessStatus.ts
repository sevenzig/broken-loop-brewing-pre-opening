import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api/apiClient';
import { authClient } from '../utils/api/authClient';

interface BusinessStatus {
  isOpen: boolean;
  lastUpdated: string;
  updatedBy: string;
}

interface UseBusinessStatusReturn {
  businessStatus: BusinessStatus | null;
  loading: boolean;
  error: string | null;
  updateBusinessStatus: (isOpen: boolean) => Promise<void>;
  resetBusinessStatus: () => Promise<void>;
  refreshStatus: () => Promise<void>;
}

/**
 * useBusinessStatus - Hook for managing business open/closed status
 * 
 * @returns Object containing business status, loading state, error state, and update methods
 */
export const useBusinessStatus = (): UseBusinessStatusReturn => {
  const [businessStatus, setBusinessStatus] = useState<BusinessStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Environment detection is now handled in the API client

  // Fetch current business status
  const fetchBusinessStatus = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/business-status');
      if (response.success) {
        setBusinessStatus(response.data as BusinessStatus);
      } else {
        throw new Error(response.message || 'Failed to fetch business status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch business status';
      setError(errorMessage);
      console.error('Error fetching business status:', err);
      
      // Set default status on error - business is closed by default (show ComingSoonSplash)
      const defaultStatus: BusinessStatus = {
        isOpen: false,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      };
      setBusinessStatus(defaultStatus);
      
      // Log the error for debugging
      console.warn('Using default business status due to API error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update business status (admin only)
  const updateBusinessStatus = useCallback(async (isOpen: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authClient.post('/business-status', { isOpen });
      if (response.success) {
        setBusinessStatus(response.data as BusinessStatus);
        // Trigger a refresh for all other instances of this hook
        window.dispatchEvent(new CustomEvent('businessStatusUpdated', { 
          detail: response.data as BusinessStatus 
        }));
      } else {
        throw new Error(response.error || 'Failed to update business status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update business status';
      setError(errorMessage);
      console.error('Error updating business status:', err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, []);

  // Reset business status to business hours
  const resetBusinessStatus = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authClient.post('/business-status', { action: 'reset' });
      if (response.success) {
        setBusinessStatus(response.data as BusinessStatus);
        // Trigger a refresh for all other instances of this hook
        window.dispatchEvent(new CustomEvent('businessStatusUpdated', { 
          detail: response.data as BusinessStatus 
        }));
      } else {
        throw new Error(response.error || 'Failed to reset business status');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset business status';
      setError(errorMessage);
      console.error('Error resetting business status:', err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh business status
  const refreshStatus = useCallback(async (): Promise<void> => {
    await fetchBusinessStatus();
  }, [fetchBusinessStatus]);

  // Fetch status on mount
  useEffect(() => {
    fetchBusinessStatus();
  }, [fetchBusinessStatus]);

  // Listen for business status updates from other instances
  useEffect(() => {
    const handleBusinessStatusUpdate = (event: CustomEvent) => {
      console.log('Business status updated via event:', event.detail);
      setBusinessStatus(event.detail);
    };

    window.addEventListener('businessStatusUpdated', handleBusinessStatusUpdate as EventListener);
    
    return () => {
      window.removeEventListener('businessStatusUpdated', handleBusinessStatusUpdate as EventListener);
    };
  }, []);

  return {
    businessStatus,
    loading,
    error,
    updateBusinessStatus,
    resetBusinessStatus,
    refreshStatus,
  };
};
