import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../utils/api/apiClient';
import { authClient } from '../utils/api/authClient';

interface AgeVerificationSettings {
  enabled: boolean;
  lastUpdated: string;
  updatedBy: string;
}

interface UseAgeVerificationSettingsReturn {
  ageVerificationSettings: AgeVerificationSettings | null;
  loading: boolean;
  error: string | null;
  updateAgeVerificationSettings: (enabled: boolean) => Promise<void>;
  refreshSettings: () => Promise<void>;
}

/**
 * useAgeVerificationSettings - Hook for managing age verification settings
 * 
 * @returns Object containing age verification settings, loading state, error state, and update methods
 */
export const useAgeVerificationSettings = (): UseAgeVerificationSettingsReturn => {
  const [ageVerificationSettings, setAgeVerificationSettings] = useState<AgeVerificationSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch current age verification settings
  const fetchAgeVerificationSettings = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiClient.get('/api/age-verification');
      if (response.success) {
        setAgeVerificationSettings(response.data as AgeVerificationSettings);
      } else {
        throw new Error(response.message || 'Failed to fetch age verification settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch age verification settings';
      setError(errorMessage);
      console.error('Error fetching age verification settings:', err);
      
      // Set default settings on error - enabled by default for legal compliance
      const defaultSettings: AgeVerificationSettings = {
        enabled: true,
        lastUpdated: new Date().toISOString(),
        updatedBy: 'system'
      };
      setAgeVerificationSettings(defaultSettings);
      
      // Log the error for debugging
      console.warn('Using default age verification settings due to API error:', errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update age verification settings (admin only)
  const updateAgeVerificationSettings = useCallback(async (enabled: boolean): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await authClient.post('/age-verification', { enabled });
      if (response.success) {
        setAgeVerificationSettings(response.data as AgeVerificationSettings);
        // Trigger a refresh for all other instances of this hook
        window.dispatchEvent(new CustomEvent('ageVerificationSettingsUpdated', { 
          detail: response.data as AgeVerificationSettings 
        }));
      } else {
        throw new Error(response.error || 'Failed to update age verification settings');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update age verification settings';
      setError(errorMessage);
      console.error('Error updating age verification settings:', err);
      throw err; // Re-throw to allow caller to handle
    } finally {
      setLoading(false);
    }
  }, []);

  // Refresh age verification settings
  const refreshSettings = useCallback(async (): Promise<void> => {
    await fetchAgeVerificationSettings();
  }, [fetchAgeVerificationSettings]);

  // Fetch settings on mount
  useEffect(() => {
    fetchAgeVerificationSettings();
  }, [fetchAgeVerificationSettings]);

  // Listen for age verification settings updates from other instances
  useEffect(() => {
    const handleAgeVerificationSettingsUpdate = (event: CustomEvent) => {
      console.log('Age verification settings updated via event:', event.detail);
      setAgeVerificationSettings(event.detail);
    };

    window.addEventListener('ageVerificationSettingsUpdated', handleAgeVerificationSettingsUpdate as EventListener);
    
    return () => {
      window.removeEventListener('ageVerificationSettingsUpdated', handleAgeVerificationSettingsUpdate as EventListener);
    };
  }, []);

  return {
    ageVerificationSettings,
    loading,
    error,
    updateAgeVerificationSettings,
    refreshSettings,
  };
};
