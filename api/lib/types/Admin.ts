import type { Beer, BeerStats, BeerValidationResult } from './Beer';

export interface AdminBeer extends Beer {
  markdown: string;
  filePath: string;
  lastModified: string;
}

export interface AdminBeerListResponse {
  beers: AdminBeer[];
  total: number;
  page: number;
  limit: number;
  stats: BeerStats;
}

export interface AdminBeerEditResponse {
  beer: AdminBeer;
  dropdowns: DropdownOptions;
  validation: BeerValidationResult;
}

export interface DropdownOptions {
  statuses: DropdownOption[];
  availability: DropdownOption[];
  styles: DropdownStyleOption[];
  barrel_aged: DropdownOption[];
}

export interface DropdownOption {
  value: string | boolean;
  label: string;
  color?: string;
}

export interface DropdownStyleOption extends DropdownOption {
  category: string;
}

export interface AdminMetadata {
  dropdowns: DropdownOptions;
  stats: BeerStats;
  systemInfo: SystemInfo;
}

export interface SystemInfo {
  version: string;
  environment: string;
  githubConnected: boolean;
  contentPath: string;
  uploadPath: string;
  lastSync: string | null;
}

export interface SyncStatus {
  status: 'idle' | 'syncing' | 'completed' | 'error';
  lastSync: string | null;
  error?: string;
  progress?: {
    current: number;
    total: number;
    message: string;
  };
}

export interface UploadResponse {
  success: boolean;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  error?: string;
}

export interface GitHubConfig {
  token: string;
  owner: string;
  repo: string;
  branch: string;
  contentPath: string;
}

export interface FileOperation {
  type: 'create' | 'update' | 'delete';
  path: string;
  content?: string;
  message: string;
}

export interface BatchOperation {
  operations: FileOperation[];
  commitMessage: string;
  branch: string;
}
