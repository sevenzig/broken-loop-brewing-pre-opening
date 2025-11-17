import type { AdminBeer, AdminBeerListResponse, AdminBeerEditResponse, AdminMetadata, SyncStatus, DropdownOptions } from '../types/Admin';
import type { BeerSearchParams, BeerStats } from '../types/Beer';
export declare class AdminService {
    private beerService;
    private githubService;
    private fileService;
    private syncStatus;
    constructor(_contentPath?: string, uploadPath?: string, githubConfig?: {
        token: string;
        owner: string;
        repo: string;
        branch: string;
        contentPath: string;
    });
    initialize(): Promise<void>;
    getBeerList(params: BeerSearchParams): Promise<AdminBeerListResponse>;
    getBeerForEdit(uuid: string): Promise<AdminBeerEditResponse | null>;
    createBeer(beerData: any, content?: string): Promise<AdminBeer>;
    updateBeer(uuid: string, updates: any, content?: string): Promise<AdminBeer>;
    deleteBeer(uuid: string): Promise<void>;
    getMetadata(): Promise<AdminMetadata>;
    syncToGitHub(): Promise<void>;
    getSyncStatus(): Promise<SyncStatus>;
    uploadImage(file: any): Promise<{
        success: boolean;
        filePath?: string;
        error?: string;
    }>;
    validateBeerData(_beerData: any): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    getBeerStats(): Promise<BeerStats>;
    getDropdownOptions(): Promise<DropdownOptions>;
    refreshData(): Promise<void>;
    cleanupUnusedImages(): Promise<number>;
    getUploadStats(): Promise<{
        totalFiles: number;
        totalSize: number;
        averageSize: number;
    }>;
    getGitHubInfo(): Promise<{
        connected: boolean;
        repoInfo?: any;
        lastCommit?: any;
    }>;
    private updateSyncStatus;
    validateMarkdownFile(uuid: string): Promise<{
        isValid: boolean;
        errors: string[];
    }>;
    getFileInfo(filePath: string): Promise<{
        exists: boolean;
        size?: number;
        mimeType?: string;
    }>;
    listUploadedFiles(): Promise<string[]>;
}
//# sourceMappingURL=AdminService.d.ts.map