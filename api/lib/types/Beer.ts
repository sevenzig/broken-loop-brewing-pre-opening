export interface Beer {
  // System fields
  uuid: string;
  created_at: string;
  updated_at: string;
  
  // Required fields
  name: string;
  image: string;
  slug: string;
  abv: string;
  ibu: string;
  srm: string;
  style: string;
  status: BeerStatus;
  brief_description: string;
  
  // Optional constrained fields
  availability?: BeerAvailability;
  tapped_on?: string;
  barrel_aged?: boolean;
  
  // Optional text fields
  hops?: string;
  malts?: string;
  yeast?: string;
  flavor_profile?: string;
  aroma?: string;
  appearance?: string;
  
  // Legacy fields (for backward compatibility)
  grain_bill?: string;
  featured?: boolean;
}

export type BeerStatus = 
  | 'on-tap'
  | 'seasonal'
  | 'coming-soon'
  | 'limited-edition'
  | 'sold-out'
  | 'archived'
  | 'retired';

export type BeerAvailability = 
  | 'Year-round'
  | 'Spring'
  | 'Summer'
  | 'Fall'
  | 'Winter'
  | 'Limited'
  | 'Seasonal';

export interface BeerFormData extends Omit<Beer, 'uuid' | 'created_at' | 'updated_at'> {
  uuid?: string;
}

export interface BeerCreateRequest {
  beer: BeerFormData;
  content?: string;
}

export interface BeerUpdateRequest {
  beer: Partial<BeerFormData>;
  content?: string;
}

export interface BeerListResponse {
  beers: Beer[];
  total: number;
  page: number;
  limit: number;
}

export interface BeerResponse {
  beer: Beer;
  content: string;
  markdown: string;
}

export interface BeerValidationError {
  field: string;
  message: string;
  value?: any;
}

export interface BeerValidationResult {
  isValid: boolean;
  errors: BeerValidationError[];
}

export interface BeerSearchParams {
  status?: BeerStatus;
  style?: string;
  availability?: BeerAvailability;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: 'name' | 'status' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

export interface BeerStats {
  total: number;
  onTap: number;
  seasonal: number;
  comingSoon: number;
  limitedEdition: number;
  soldOut: number;
  archived: number;
  retired: number;
}
