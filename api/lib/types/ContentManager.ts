// Core Content Types
export type ContentType = 'beer' | 'food' | 'event';

export interface ContentItem {
  id: string;
  type: ContentType;
  slug: string;
  metadata: Record<string, any>;
  content: string;
  lastModified: string;
  filePath: string;
  version: string;
}

// CRUD Operations
export interface ContentCRUDOptions {
  validate?: boolean;
  commitMessage?: string;
  conflictResolution?: ConflictResolutionStrategy;
  branch?: string;
  author?: {
    name: string;
    email: string;
  };
}

// Search and Filtering
export interface ContentSearchParams {
  search?: string;
  status?: string;
  tags?: string[];
  category?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ContentSearchResult<T extends ContentItem = ContentItem> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Validation
export interface ValidationRule {
  type: 'required' | 'string' | 'number' | 'email' | 'url' | 'date' | 'enum' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value?: any;
  values?: any[];
  pattern?: RegExp;
  message?: string;
  level?: 'error' | 'warning';
  validator?: (value: any, fieldName: string) => { isValid: boolean; message: string };
}

export interface ValidationSchema {
  required: string[];
  fields: Record<string, ValidationRule[]>;
  contentRules?: ValidationRule[];
}

export interface ContentValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Conflict Resolution
export interface ConflictResolutionStrategy {
  type: 'overwrite' | 'merge' | 'reject' | 'version' | 'interactive';
  mergeRules?: Record<string, 'existing' | 'incoming' | 'merge' | 'both'>;
  contentMergeStrategy?: 'existing' | 'incoming' | 'merge' | 'append';
  allowHighSeverityMerge?: boolean;
}

export interface ConflictAnalysis {
  hasConflict: boolean;
  metadataConflicts: string[];
  contentConflict: boolean;
  severity: 'low' | 'medium' | 'high';
  autoResolvable: boolean;
  existingVersion: string;
  incomingVersion: string;
  existingModified: string;
  incomingModified: string;
}

export interface ContentConflictResolution {
  action: 'overwrite' | 'merge' | 'reject' | 'version';
  mergedContent?: ContentItem;
  reason: string;
  conflictAnalysis: ConflictAnalysis;
  requiresInteraction?: boolean;
}

// Batch Operations
export interface BatchContentOperationItem {
  action: 'create' | 'update' | 'delete';
  type: ContentType;
  id?: string;
  data: Partial<ContentItem>;
  options?: ContentCRUDOptions;
}

export interface BatchContentOperation {
  operations: BatchContentOperationItem[];
  stopOnFirstError?: boolean;
  delayBetweenOperations?: number;
}

// Specific Content Types
export interface BeerContent extends ContentItem {
  type: 'beer';
  metadata: {
    name: string;
    slug: string;
    abv: string;
    ibu: string;
    srm?: string;
    style: string;
    status: 'on-tap' | 'coming-soon' | 'seasonal' | 'archived';
    availability: 'year-round' | 'seasonal' | 'limited' | 'one-time';
    tapped_on?: string;
    featured?: boolean;
    brief_description: string;
    grain_bill?: string;
    hops?: string;
    malts?: string;
    yeast?: string;
    flavor_profile?: string;
    aroma?: string;
    appearance?: string;
    image?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface FoodContent extends ContentItem {
  type: 'food';
  metadata: {
    name: string;
    slug: string;
    category: 'appetizers' | 'mains' | 'sides' | 'desserts' | 'specials';
    status: 'available' | 'unavailable' | 'seasonal' | 'archived';
    price: string;
    brief_description?: string;
    ingredients?: string[];
    allergens?: string[];
    dietary_info?: string[];
    image?: string;
    created_at: string;
    updated_at: string;
  };
}

export interface EventContent extends ContentItem {
  type: 'event';
  metadata: {
    name: string;
    slug: string;
    date: string;
    start_time?: string;
    end_time?: string;
    status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
    event_type?: string;
    location?: string;
    price?: string;
    capacity?: number;
    brief_description?: string;
    registration_required?: boolean;
    registration_url?: string;
    image?: string;
    created_at: string;
    updated_at: string;
  };
}

// API Response Types
export interface ContentManagerResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  warnings?: string[];
}

export interface ContentListResponse<T extends ContentItem = ContentItem> extends ContentManagerResponse<ContentSearchResult<T>> {}

export interface ContentItemResponse<T extends ContentItem = ContentItem> extends ContentManagerResponse<T> {}

// Service Configuration
export interface ContentManagerConfig {
  github: {
    token: string;
    owner: string;
    repo: string;
    branch: string;
    contentPath: string;
  };
  validation: {
    enabled: boolean;
    strict: boolean;
  };
  conflictResolution: {
    defaultStrategy: ConflictResolutionStrategy;
    autoResolve: boolean;
  };
}

// File System Types (for GitHub integration)
export interface FileSystemItem {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified?: string;
  sha?: string;
}

export interface DirectoryListing {
  path: string;
  items: FileSystemItem[];
  totalItems: number;
}

// Webhook Types (for GitHub webhooks)
export interface WebhookPayload {
  action: string;
  repository: {
    name: string;
    full_name: string;
  };
  commits?: Array<{
    id: string;
    message: string;
    added: string[];
    modified: string[];
    removed: string[];
  }>;
}

// Sync Status
export interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  lastSync?: string | null;
  error?: string;
}

// Content Template
export interface ContentTemplate {
  type: ContentType;
  name: string;
  description: string;
  defaultMetadata: Record<string, any>;
  defaultContent: string;
  schema: ValidationSchema;
}

// Search Index (for enhanced search capabilities)
export interface SearchIndex {
  id: string;
  type: ContentType;
  title: string;
  content: string;
  metadata: Record<string, any>;
  tags: string[];
  lastIndexed: string;
}

// Analytics and Statistics
export interface ContentStatistics {
  totalItems: number;
  itemsByType: Record<ContentType, number>;
  itemsByStatus: Record<string, number>;
  recentlyModified: ContentItem[];
  mostViewed?: ContentItem[];
  createdThisMonth: number;
  updatedThisWeek: number;
}

// Import/Export Types
export interface ContentExportOptions {
  format: 'json' | 'yaml' | 'markdown' | 'csv';
  includeContent: boolean;
  types?: ContentType[];
  filters?: ContentSearchParams;
}

export interface ContentImportOptions {
  format: 'json' | 'yaml' | 'markdown' | 'csv';
  overwriteExisting: boolean;
  validateBeforeImport: boolean;
  dryRun?: boolean;
}

export interface ImportResult {
  success: boolean;
  imported: number;
  skipped: number;
  errors: Array<{
    item: string;
    error: string;
  }>;
}

// Backup Types
export interface BackupOptions {
  includeContent: boolean;
  includeMetadata: boolean;
  compressionLevel?: number;
  encryptionKey?: string;
}

export interface BackupMetadata {
  id: string;
  created: string;
  size: number;
  itemCount: number;
  types: ContentType[];
  checksum: string;
}