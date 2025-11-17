import type { GitHubConfig, FileOperation, BatchOperation } from '../types/Admin';
export declare class GitHubService {
    private octokit;
    private config;
    private initialized;
    constructor(config: GitHubConfig);
    initialize(): Promise<void>;
    private testConnection;
    getFileContent(filePath: string): Promise<string | null>;
    createFile(filePath: string, content: string, message: string): Promise<void>;
    updateFile(filePath: string, content: string, message: string): Promise<void>;
    deleteFile(filePath: string, message: string): Promise<void>;
    executeOperation(operation: FileOperation): Promise<void>;
    executeBatchOperation(batch: BatchOperation): Promise<void>;
    syncLocalFiles(localContentPath: string): Promise<void>;
    getLastCommit(): Promise<{
        sha: string;
        message: string;
        date: string;
    } | null>;
    getBranchInfo(): Promise<{
        name: string;
        sha: string;
        protected: boolean;
    } | null>;
    createPullRequest(title: string, body: string, headBranch: string): Promise<string>;
    getRepositoryInfo(): Promise<{
        name: string;
        description: string;
        url: string;
    }>;
}
//# sourceMappingURL=GitHubService.d.ts.map