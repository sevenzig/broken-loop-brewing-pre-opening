import { BeerService } from './BeerService';
import { GitHubService } from './GitHubService';
import { FileService } from './FileService';
import { getDropdownOptionsForForm } from '../utils/dropdowns';
export class AdminService {
    constructor(_contentPath = 'src/data/beers', uploadPath = 'public/uploads', githubConfig) {
        this.githubService = null;
        this.syncStatus = {
            status: 'idle',
            lastSync: null
        };
        this.beerService = new BeerService();
        this.fileService = new FileService(uploadPath);
        if (githubConfig) {
            this.githubService = new GitHubService(githubConfig);
        }
    }
    async initialize() {
        try {
            await Promise.all([
                this.beerService.initialize(),
                this.fileService.initialize(),
                this.githubService?.initialize()
            ]);
            console.log('Admin service initialized successfully');
        }
        catch (error) {
            console.error('Failed to initialize AdminService:', error);
            throw error;
        }
    }
    async getBeerList(params) {
        await this.initialize();
        const response = await this.beerService.searchBeers(params);
        const stats = await this.beerService.getBeerStats();
        // Convert to AdminBeer format with additional metadata
        const adminBeers = await Promise.all(response.beers.map(async (beer) => {
            const beerWithContent = await this.beerService.getBeerWithContent(beer.uuid);
            return {
                ...beer,
                markdown: beerWithContent?.markdown || '',
                filePath: `${beer.uuid}.md`,
                lastModified: beer.updated_at
            };
        }));
        return {
            beers: adminBeers,
            total: response.total,
            page: response.page,
            limit: response.limit,
            stats
        };
    }
    async getBeerForEdit(uuid) {
        await this.initialize();
        const beerWithContent = await this.beerService.getBeerWithContent(uuid);
        if (!beerWithContent) {
            return null;
        }
        const dropdowns = getDropdownOptionsForForm();
        const validation = { isValid: true, errors: [] }; // No validation errors for existing beer
        const adminBeer = {
            ...beerWithContent.beer,
            markdown: beerWithContent.markdown,
            filePath: `${uuid}.md`,
            lastModified: beerWithContent.beer.updated_at
        };
        return {
            beer: adminBeer,
            dropdowns,
            validation
        };
    }
    async createBeer(beerData, content) {
        await this.initialize();
        const beer = await this.beerService.createBeer(beerData, content || '');
        const beerWithContent = await this.beerService.getBeerWithContent(beer.uuid);
        // Sync to GitHub if available
        if (this.githubService && beerWithContent) {
            try {
                await this.githubService.createFile(`${beer.uuid}.md`, beerWithContent.markdown, `Add beer: ${beer.name}`);
                this.updateSyncStatus('completed', new Date().toISOString());
            }
            catch (error) {
                console.error('Failed to sync beer creation to GitHub:', error);
                this.updateSyncStatus('error', null, error instanceof Error ? error.message : 'Unknown error');
            }
        }
        return {
            ...beer,
            markdown: beerWithContent?.markdown || '',
            filePath: `${beer.uuid}.md`,
            lastModified: beer.updated_at
        };
    }
    async updateBeer(uuid, updates, content) {
        await this.initialize();
        const beer = await this.beerService.updateBeer(uuid, updates, content);
        const beerWithContent = await this.beerService.getBeerWithContent(uuid);
        // Sync to GitHub if available
        if (this.githubService && beerWithContent) {
            try {
                await this.githubService.updateFile(`${uuid}.md`, beerWithContent.markdown, `Update beer: ${beer.name}`);
                this.updateSyncStatus('completed', new Date().toISOString());
            }
            catch (error) {
                console.error('Failed to sync beer update to GitHub:', error);
                this.updateSyncStatus('error', null, error instanceof Error ? error.message : 'Unknown error');
            }
        }
        return {
            ...beer,
            markdown: beerWithContent?.markdown || '',
            filePath: `${uuid}.md`,
            lastModified: beer.updated_at
        };
    }
    async deleteBeer(uuid) {
        await this.initialize();
        const beer = await this.beerService.getBeerByUUID(uuid);
        if (!beer) {
            throw new Error(`Beer not found: ${uuid}`);
        }
        await this.beerService.deleteBeer(uuid);
        // Sync to GitHub if available
        if (this.githubService) {
            try {
                await this.githubService.deleteFile(`${uuid}.md`, `Delete beer: ${beer.name}`);
                this.updateSyncStatus('completed', new Date().toISOString());
            }
            catch (error) {
                console.error('Failed to sync beer deletion to GitHub:', error);
                this.updateSyncStatus('error', null, error instanceof Error ? error.message : 'Unknown error');
            }
        }
    }
    async getMetadata() {
        await this.initialize();
        const dropdowns = getDropdownOptionsForForm();
        const stats = await this.beerService.getBeerStats();
        const systemInfo = {
            version: '1.0.0',
            environment: process.env.NODE_ENV || 'development',
            githubConnected: this.githubService !== null,
            contentPath: 'src/data/beers',
            uploadPath: 'public/uploads',
            lastSync: this.syncStatus.lastSync
        };
        return {
            dropdowns,
            stats,
            systemInfo
        };
    }
    async syncToGitHub() {
        if (!this.githubService) {
            throw new Error('GitHub service not configured');
        }
        await this.initialize();
        this.updateSyncStatus('syncing');
        try {
            await this.githubService.syncLocalFiles('src/data/beers');
            this.updateSyncStatus('completed', new Date().toISOString());
        }
        catch (error) {
            console.error('Failed to sync to GitHub:', error);
            this.updateSyncStatus('error', null, error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }
    async getSyncStatus() {
        return this.syncStatus;
    }
    async uploadImage(file) {
        await this.initialize();
        const result = await this.fileService.saveUploadedFile(file, 'beers');
        if (result.success) {
            return {
                success: true,
                filePath: result.filePath
            };
        }
        else {
            return {
                success: false,
                error: result.error
            };
        }
    }
    async validateBeerData(_beerData) {
        await this.initialize();
        // TODO: Implement proper validation
        const validation = { isValid: true, errors: [] };
        return {
            isValid: validation.isValid,
            errors: validation.errors
        };
    }
    async getBeerStats() {
        await this.initialize();
        return await this.beerService.getBeerStats();
    }
    async getDropdownOptions() {
        return getDropdownOptionsForForm();
    }
    async refreshData() {
        // TODO: Implement refresh method
        console.log('Refresh data called');
    }
    async cleanupUnusedImages() {
        await this.initialize();
        const allBeers = await this.beerService.getAllBeers();
        const usedImages = allBeers.map(beer => beer.image).filter(Boolean);
        return await this.fileService.cleanupUnusedFiles(usedImages);
    }
    async getUploadStats() {
        await this.initialize();
        return await this.fileService.getUploadStats();
    }
    async getGitHubInfo() {
        if (!this.githubService) {
            return { connected: false };
        }
        try {
            await this.initialize();
            const [repoInfo, lastCommit] = await Promise.all([
                this.githubService.getRepositoryInfo(),
                this.githubService.getLastCommit()
            ]);
            return {
                connected: true,
                repoInfo,
                lastCommit
            };
        }
        catch (error) {
            console.error('Failed to get GitHub info:', error);
            return { connected: false };
        }
    }
    updateSyncStatus(status, lastSync, error) {
        this.syncStatus = {
            status,
            lastSync: lastSync || this.syncStatus.lastSync,
            error
        };
    }
    async validateMarkdownFile(uuid) {
        await this.initialize();
        const beerWithContent = await this.beerService.getBeerWithContent(uuid);
        if (!beerWithContent) {
            return { isValid: false, errors: ['Beer not found'] };
        }
        // TODO: Implement markdown validation
        const isValid = true;
        const errors = [];
        return { isValid, errors };
    }
    async getFileInfo(filePath) {
        await this.initialize();
        return await this.fileService.getFileInfo(filePath);
    }
    async listUploadedFiles() {
        await this.initialize();
        return await this.fileService.listFiles('beers');
    }
}
//# sourceMappingURL=AdminService.js.map