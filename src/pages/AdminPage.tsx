import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useBusinessStatus } from '../hooks/useBusinessStatus';
import { useAgeVerificationSettings } from '../hooks/useAgeVerificationSettings';
import { useToast } from '../contexts/ToastContext';

// API Response interface
interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Local Beer interface for frontend use
interface Beer {
  uuid: string;
  name: string;
  style: string;
  status: string;
  abv: string;
  ibu: string;
  brief_description: string;
  tapped_on?: string;
  created_at: string;
  updated_at: string;
}

// Admin Beers API Response
interface AdminBeersResponse {
  beers: Beer[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: {
    status: string | null;
    style: string | null;
    availability: string | null;
    search: string | null;
  };
}

// Simple API client implementation
const apiClient = {
  async get<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('auth-token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, { headers });
      const contentType = response.headers.get('content-type');
      const isJson = contentType && contentType.includes('application/json');

      if (!response.ok) {
        const text = await response.text();
        console.error(`API error (${response.status}):`, text);
        return {
          success: false,
          message: `API Error: ${response.status} - ${text || response.statusText}`,
        };
      }

      if (!isJson) {
        const text = await response.text();
        console.error('Non-JSON response:', text);
        return {
          success: false,
          message: 'API returned non-JSON response',
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  },

  async post<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('auth-token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        data: responseData,
        message: !response.ok ? responseData.message || response.statusText : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  },

  async delete<T>(url: string): Promise<ApiResponse<T>> {
    try {
      const token = localStorage.getItem('auth-token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      const responseData = await response.json();
      return {
        success: response.ok,
        data: responseData,
        message: !response.ok ? responseData.message || response.statusText : undefined,
      };
    } catch (error) {
      console.error('API request failed:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'API request failed',
      };
    }
  }
};

import styles from './AdminPage.module.css';

interface AdminPageProps {
  // Props removed - now uses useBusinessStatus hook
}

interface AdminMetadata {
  dropdowns: {
    statuses: Array<{ value: string; label: string; color: string }>;
    availability: Array<{ value: string; label: string }>;
    styles: Array<{ value: string; label: string; category: string }>;
    barrel_aged: Array<{ value: boolean; label: string }>;
  };
  stats: {
    total: number;
    onTap: number;
    seasonal: number;
    comingSoon: number;
  };
}

export const AdminPage: React.FC<AdminPageProps> = () => {
  const { user, logout } = useAuth();
  const { showSuccess, showError } = useToast();
  const { 
    businessStatus, 
    loading: statusLoading, 
    error: statusError, 
    updateBusinessStatus,
    resetBusinessStatus
  } = useBusinessStatus();

  const { 
    ageVerificationSettings, 
    loading: ageVerificationLoading, 
    error: ageVerificationError, 
    updateAgeVerificationSettings
  } = useAgeVerificationSettings();
  
  const [beers, setBeers] = useState<Beer[]>([]);
  const [metadata, setMetadata] = useState<AdminMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [styleFilter, setStyleFilter] = useState<string>('all');
  const [activeSection, setActiveSection] = useState<'general' | 'beer' | 'food' | 'events'>('general');
  const [localBusinessStatus, setLocalBusinessStatus] = useState<boolean | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [localAgeVerificationEnabled, setLocalAgeVerificationEnabled] = useState<boolean | null>(null);
  const [ageVerificationSaving, setAgeVerificationSaving] = useState(false);


  const loadAdminData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load beers and metadata from proper admin APIs
      const [beersResponse, metadataResponse] = await Promise.all([
        apiClient.get<AdminBeersResponse>('/api/admin/beers'),
        apiClient.get<AdminMetadata>('/api/admin/metadata')
      ]);
      
      if (beersResponse.success && beersResponse.data) {
        setBeers(beersResponse.data.beers || []);
      } else {
        throw new Error(beersResponse.message || 'Failed to load beers');
      }
      
      if (metadataResponse.success && metadataResponse.data) {
        setMetadata(metadataResponse.data as AdminMetadata);
      } else {
        throw new Error(metadataResponse.message || 'Failed to load metadata');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admin data';
      setError(errorMessage);
      showError('Error', errorMessage);
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadAdminData();
    }
  }, [user]);

  // Sync local business status with hook's business status
  useEffect(() => {
    if (businessStatus) {
      setLocalBusinessStatus(businessStatus.isOpen);
    }
  }, [businessStatus]);

  // Sync local age verification settings with hook's age verification settings
  useEffect(() => {
    if (ageVerificationSettings) {
      setLocalAgeVerificationEnabled(ageVerificationSettings.enabled);
    }
  }, [ageVerificationSettings]);

  const handleBusinessStatusToggle = (isOpen: boolean) => {
    setLocalBusinessStatus(isOpen);
  };

  const handleBusinessStatusSave = async () => {
    if (localBusinessStatus === null || localBusinessStatus === businessStatus?.isOpen) {
      return; // No changes to save
    }

    try {
      setStatusSaving(true);
      await updateBusinessStatus(localBusinessStatus);
      showSuccess(
        'Success', 
        `Business status updated to ${localBusinessStatus ? 'Open' : 'Closed'}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update business status';
      showError('Error', errorMessage);
      // Revert local state on error
      setLocalBusinessStatus(businessStatus?.isOpen ?? null);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleBusinessStatusReset = async () => {
    try {
      setStatusSaving(true);
      await resetBusinessStatus();
      showSuccess(
        'Success', 
        'Business status reset to business hours'
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to reset business status';
      showError('Error', errorMessage);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAgeVerificationToggle = (enabled: boolean) => {
    setLocalAgeVerificationEnabled(enabled);
  };

  const handleAgeVerificationSave = async () => {
    if (localAgeVerificationEnabled === null || localAgeVerificationEnabled === ageVerificationSettings?.enabled) {
      return; // No changes to save
    }

    try {
      setAgeVerificationSaving(true);
      await updateAgeVerificationSettings(localAgeVerificationEnabled);
      showSuccess(
        'Success', 
        `Age verification ${localAgeVerificationEnabled ? 'enabled' : 'disabled'}`
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update age verification settings';
      showError('Error', errorMessage);
      // Revert local state on error
      setLocalAgeVerificationEnabled(ageVerificationSettings?.enabled ?? null);
    } finally {
      setAgeVerificationSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    showSuccess('Success', 'Logged out successfully');
  };

  const handleDeleteBeer = async (beerUuid: string, beerName: string) => {
    if (!confirm(`Are you sure you want to delete "${beerName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await apiClient.delete(`/api/admin/beers/${beerUuid}/delete`);
      
      if (response.success) {
        showSuccess('Success', `Beer "${beerName}" deleted successfully`);
        // Reload the beer list to reflect the changes
        await loadAdminData();
      } else {
        throw new Error(response.message || 'Failed to delete beer');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete beer';
      showError('Error', errorMessage);
      console.error('Error deleting beer:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter beers based on search and filters
  const filteredBeers = beers.filter(beer => {
    const matchesSearch = beer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         beer.style.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || beer.status === statusFilter;
    const matchesStyle = styleFilter === 'all' || beer.style === styleFilter;
    
    return matchesSearch && matchesStatus && matchesStyle;
  });

  if (!user) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.adminCard}>
          <h1>Access Denied</h1>
          <p>You must be logged in to access the admin panel.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.adminCard}>
          <h1>Loading Admin Panel...</h1>
          <p>Please wait while we load your data.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.adminContainer}>
        <div className={styles.adminCard}>
          <h1>Error Loading Admin Panel</h1>
          <p>{error}</p>
          <button onClick={loadAdminData} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Render the active section content
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'general':
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>General Settings</h2>
            
            {/* Business Status Section */}
            <section className={styles.statusSection}>
              <h3 className={styles.subsectionTitle}>
                Business Status
                {localBusinessStatus !== businessStatus?.isOpen && (
                  <span className={styles.changeIndicator}>*</span>
                )}
                {statusLoading && (
                  <span className={styles.loadingIndicator}>...</span>
                )}
              </h3>
              <div className={styles.statusIndicator}>
                <div className={`${styles.statusDot} ${localBusinessStatus ? styles.statusOpen : styles.statusClosed}`}></div>
                <span className={styles.statusText}>
                  {localBusinessStatus ? 'Open' : 'Closed'}
                </span>
              </div>
              
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="businessStatus"
                    value="open"
                    checked={localBusinessStatus === true}
                    onChange={() => handleBusinessStatusToggle(true)}
                    disabled={statusLoading}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Open</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="businessStatus"
                    value="closed"
                    checked={localBusinessStatus === false}
                    onChange={() => handleBusinessStatusToggle(false)}
                    disabled={statusLoading}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Closed</span>
                </label>
              </div>
              
              <div className={styles.statusActions}>
                <button
                  className={styles.saveButton}
                  onClick={handleBusinessStatusSave}
                  disabled={statusSaving || localBusinessStatus === businessStatus?.isOpen}
                  title={localBusinessStatus === businessStatus?.isOpen ? 'No changes to save' : 'Save business status changes'}
                >
                  {statusSaving ? 'Saving...' : localBusinessStatus === businessStatus?.isOpen ? 'No Changes' : 'Save Changes'}
                </button>
                <button
                  className={styles.resetButton}
                  onClick={handleBusinessStatusReset}
                  disabled={statusSaving}
                  title="Reset to business hours"
                >
                  Reset to Hours
                </button>
              </div>
              
              {businessStatus && (
                <div className={styles.statusDetails}>
                  <p><strong>Last Updated:</strong> {new Date(businessStatus.lastUpdated).toLocaleString()}</p>
                  <p><strong>Updated By:</strong> {businessStatus.updatedBy}</p>
                </div>
              )}
              
              {statusError && (
                <p className={styles.errorMessage}>Error: {statusError}</p>
              )}
            </section>

            {/* Age Verification Settings Section */}
            <section className={styles.statusSection}>
              <h3 className={styles.subsectionTitle}>
                Age Verification
                {localAgeVerificationEnabled !== ageVerificationSettings?.enabled && (
                  <span className={styles.changeIndicator}>*</span>
                )}
                {ageVerificationLoading && (
                  <span className={styles.loadingIndicator}>...</span>
                )}
              </h3>
              <div className={styles.statusIndicator}>
                <div className={`${styles.statusDot} ${localAgeVerificationEnabled ? styles.statusOpen : styles.statusClosed}`}></div>
                <span className={styles.statusText}>
                  {localAgeVerificationEnabled ? 'Enabled' : 'Disabled'}
                </span>
              </div>
              
              <div className={styles.radioGroup}>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="ageVerification"
                    value="enabled"
                    checked={localAgeVerificationEnabled === true}
                    onChange={() => handleAgeVerificationToggle(true)}
                    disabled={ageVerificationLoading}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Enabled</span>
                </label>
                <label className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="ageVerification"
                    value="disabled"
                    checked={localAgeVerificationEnabled === false}
                    onChange={() => handleAgeVerificationToggle(false)}
                    disabled={ageVerificationLoading}
                    className={styles.radioInput}
                  />
                  <span className={styles.radioText}>Disabled</span>
                </label>
              </div>
              
              <div className={styles.statusActions}>
                <button
                  className={styles.saveButton}
                  onClick={handleAgeVerificationSave}
                  disabled={ageVerificationSaving || localAgeVerificationEnabled === ageVerificationSettings?.enabled}
                  title={localAgeVerificationEnabled === ageVerificationSettings?.enabled ? 'No changes to save' : 'Save age verification changes'}
                >
                  {ageVerificationSaving ? 'Saving...' : localAgeVerificationEnabled === ageVerificationSettings?.enabled ? 'No Changes' : 'Save Changes'}
                </button>
              </div>
              
              {ageVerificationSettings && (
                <div className={styles.statusDetails}>
                  <p><strong>Last Updated:</strong> {new Date(ageVerificationSettings.lastUpdated).toLocaleString()}</p>
                  <p><strong>Updated By:</strong> {ageVerificationSettings.updatedBy}</p>
                </div>
              )}
              
              {ageVerificationError && (
                <p className={styles.errorMessage}>Error: {ageVerificationError}</p>
              )}
            </section>
          </div>
        );

      case 'beer':
        return (
          <div className={styles.sectionContent}>
            <div className={styles.beerManagementHeader}>
              <h2 className={styles.sectionTitle}>Beer Management</h2>
              <div className={styles.quickStats}>
                <span className={styles.statBadge}>Total: {metadata?.stats.total || 0}</span>
                <span className={styles.statBadge}>On Tap: {metadata?.stats.onTap || 0}</span>
                <span className={styles.statBadge}>Coming Soon: {metadata?.stats.comingSoon || 0}</span>
              </div>
            </div>
            
            <div className={styles.addBeerSection}>
              <button 
                className={styles.addBeerButton}
                onClick={() => window.location.href = '/admin/beers/new'}
              >
                + Add New Beer
              </button>
            </div>
            
            <div className={styles.controlsSection}>
              <div className={styles.searchSection}>
                <input
                  type="text"
                  placeholder="Search beers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              
              <div className={styles.filterSection}>
                <div className={styles.statusFilters}>
                  <button 
                    className={`${styles.filterButton} ${statusFilter === 'all' ? styles.filterButtonActive : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All
                  </button>
                  <button 
                    className={`${styles.filterButton} ${statusFilter === 'on-tap' ? styles.filterButtonActive : ''}`}
                    onClick={() => setStatusFilter('on-tap')}
                  >
                    On Tap
                  </button>
                  <button 
                    className={`${styles.filterButton} ${statusFilter === 'coming-soon' ? styles.filterButtonActive : ''}`}
                    onClick={() => setStatusFilter('coming-soon')}
                  >
                    Coming Soon
                  </button>
                  <button 
                    className={`${styles.filterButton} ${statusFilter === 'seasonal' ? styles.filterButtonActive : ''}`}
                    onClick={() => setStatusFilter('seasonal')}
                  >
                    Seasonal
                  </button>
                </div>
                
                <select
                  value={styleFilter}
                  onChange={(e) => setStyleFilter(e.target.value)}
                  className={styles.filterSelect}
                >
                  <option value="all">All Styles</option>
                  {metadata?.dropdowns.styles.map(style => (
                    <option key={style.value} value={style.value}>
                      {style.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.beerTableContainer}>
              <table className={styles.beerTable}>
                <caption>Beer Inventory Management</caption>
                <thead>
                  <tr>
                    <th className={styles.beerNameHeader}>Name</th>
                    <th className={styles.beerStyleHeader}>Style</th>
                    <th className={styles.beerAbvHeader}>ABV</th>
                    <th className={styles.beerIbuHeader}>IBU</th>
                    <th className={styles.beerStatusHeader}>Status</th>
                    <th className={styles.beerTappedHeader}>Tapped</th>
                    <th className={styles.beerActionsHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBeers.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={styles.noData}>
                        No beers found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredBeers.map(beer => (
                      <tr key={beer.uuid} className={styles.beerRow}>
                        <td className={styles.beerNameCell}>
                          <div className={styles.beerName}>{beer.name}</div>
                          <div className={styles.beerDescription}>{beer.brief_description}</div>
                        </td>
                        <td className={styles.beerStyleCell}>{beer.style}</td>
                        <td className={styles.beerAbvCell}>{beer.abv}%</td>
                        <td className={styles.beerIbuCell}>{beer.ibu}</td>
                        <td className={styles.beerStatusCell}>
                          <span className={`${styles.statusBadge} ${styles[`status${beer.status.replace('-', '')}`]}`}>
                            {beer.status === 'on-tap' && 'On Tap'}
                            {beer.status === 'coming-soon' && 'Coming Soon'}
                            {beer.status === 'seasonal' && 'Seasonal'}
                            {beer.status === 'retired' && 'Retired'}
                            {!['on-tap', 'coming-soon', 'seasonal', 'retired'].includes(beer.status) && beer.status}
                          </span>
                        </td>
                        <td className={styles.beerTappedCell}>
                          {beer.tapped_on ? new Date(beer.tapped_on).toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' }) : '-'}
                        </td>
                        <td className={styles.beerActionsCell}>
                          <div className={styles.actionButtons}>
                            <button 
                              className={styles.editButton}
                              onClick={() => window.location.href = `/admin/beers/${beer.uuid}/edit`}
                              title="Edit beer"
                            >
                              Edit
                            </button>
                            <button 
                              className={styles.deleteButton}
                              onClick={() => handleDeleteBeer(beer.uuid, beer.name)}
                              title="Delete beer"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className={styles.beerManagementFooter}>
              <div className={styles.tableInfo}>
                Showing {filteredBeers.length} of {beers.length} beers
              </div>
            </div>
          </div>
        );

      case 'food':
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Food Management</h2>
            <div className={styles.placeholderSection}>
              <p>Food management features coming soon...</p>
              <p>This section will include:</p>
              <ul>
                <li>Menu item management</li>
                <li>Category organization</li>
                <li>Pricing updates</li>
                <li>Availability status</li>
              </ul>
            </div>
          </div>
        );

      case 'events':
        return (
          <div className={styles.sectionContent}>
            <h2 className={styles.sectionTitle}>Event Management</h2>
            <div className={styles.placeholderSection}>
              <p>Event management features coming soon...</p>
              <p>This section will include:</p>
              <ul>
                <li>Event creation and editing</li>
                <li>Date and time management</li>
                <li>Event descriptions</li>
                <li>RSVP tracking</li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={styles.adminContainer}>
      <div className={styles.adminLayout}>
        {/* Sidebar Navigation */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <div className={styles.sidebarBrand}>
              <div className={styles.brandIcon}>BL</div>
              <h1 className={styles.sidebarTitle}>Admin Panel</h1>
            </div>
          </div>
          
          <nav className={styles.sidebarNav}>
            <button
              className={`${styles.navButton} ${activeSection === 'general' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveSection('general')}
            >
              <span className={styles.navIcon}>⚙</span>
              <span className={styles.navLabel}>General</span>
            </button>
            <button
              className={`${styles.navButton} ${activeSection === 'beer' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveSection('beer')}
            >
              <span className={styles.navIcon}>BL</span>
              <span className={styles.navLabel}>Beer Management</span>
            </button>
            <button
              className={`${styles.navButton} ${activeSection === 'food' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveSection('food')}
            >
              <span className={styles.navIcon}>F</span>
              <span className={styles.navLabel}>Food Management</span>
            </button>
            <button
              className={`${styles.navButton} ${activeSection === 'events' ? styles.navButtonActive : ''}`}
              onClick={() => setActiveSection('events')}
            >
              <span className={styles.navIcon}>E</span>
              <span className={styles.navLabel}>Event Management</span>
            </button>
          </nav>

          <div className={styles.sidebarFooter}>
            <div className={styles.userInfo}>
              <div className={styles.userAvatar}>
                <span className={styles.avatarText}>{user.username.charAt(0).toUpperCase()}</span>
              </div>
              <div className={styles.userDetails}>
                <span className={styles.userName}>{user.username}</span>
                <span className={styles.userRole}>Administrator</span>
              </div>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              <span className={styles.logoutIcon}>→</span>
              <span className={styles.logoutText}>Logout</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className={styles.mainContent}>
          {renderSectionContent()}
        </main>
      </div>
    </div>
  );
};

export default AdminPage;
