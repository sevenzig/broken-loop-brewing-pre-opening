/**
 * Mock Data Service
 * Provides fake data during development when API endpoints aren't available
 */

export interface MockBusinessStatus {
  isOpen: boolean;
  lastUpdated: string;
  updatedBy: string;
}

// Match the AdminPage Beer interface
export interface MockBeer {
  uuid: string;
  name: string;
  style: string;
  status: string;
  abv: string;
  ibu: string;
  brief_description: string;
  created_at: string;
  updated_at: string;
}

// Match the AdminPage AdminMetadata interface
export interface MockMetadata {
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

// Mock business status data
export const mockBusinessStatus: MockBusinessStatus = {
  isOpen: true,
  lastUpdated: new Date().toISOString(),
  updatedBy: 'system'
};

// Mock beer data
export const mockBeers: MockBeer[] = [
  {
    uuid: 'mock-beer-1',
    name: 'Hoppy Trails IPA',
    style: 'American IPA',
    abv: '6.5%',
    ibu: '65',
    brief_description: 'A bold, hop-forward IPA with citrus and pine notes.',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    uuid: 'mock-beer-2',
    name: 'Midnight Stout',
    style: 'American Stout',
    abv: '5.8%',
    ibu: '45',
    brief_description: 'Rich, roasty stout with chocolate and coffee flavors.',
    status: 'active',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  },
  {
    uuid: 'mock-beer-3',
    name: 'Golden Wheat',
    style: 'American Wheat',
    abv: '4.8%',
    ibu: '25',
    brief_description: 'Light, refreshing wheat beer with subtle citrus notes.',
    status: 'draft',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  }
];

// Mock metadata
export const mockMetadata: MockMetadata = {
  dropdowns: {
    statuses: [
      { value: 'active', label: 'Active', color: 'green' },
      { value: 'draft', label: 'Draft', color: 'blue' },
      { value: 'seasonal', label: 'Seasonal', color: 'orange' }
    ],
    availability: [
      { value: 'on-tap', label: 'On Tap' },
      { value: 'bottles', label: 'Bottles' },
      { value: 'growlers', label: 'Growlers' }
    ],
    styles: [
      { value: 'american-ipa', label: 'American IPA', category: 'IPA' },
      { value: 'american-stout', label: 'American Stout', category: 'Stout' },
      { value: 'american-wheat', label: 'American Wheat', category: 'Wheat' }
    ],
    barrel_aged: [
      { value: true, label: 'Yes' },
      { value: false, label: 'No' }
    ]
  },
  stats: {
    total: mockBeers.length,
    onTap: mockBeers.filter(b => b.status === 'active').length,
    seasonal: mockBeers.filter(b => b.status === 'seasonal').length,
    comingSoon: 0
  }
};

// Mock API responses
export const createMockResponse = <T>(data: T, success: boolean = true) => ({
  success,
  data,
  timestamp: Date.now()
});

export const createMockErrorResponse = (error: string, code: string = 'MOCK_ERROR') => ({
  success: false,
  error,
  code,
  timestamp: Date.now()
});
