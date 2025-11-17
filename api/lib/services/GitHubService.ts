import { Octokit } from '@octokit/rest';
import { promises as fs } from 'fs';
import path from 'path';
import type { GitHubConfig, FileOperation, BatchOperation } from '../types/Admin';

export class GitHubService {
  private octokit: Octokit;
  private config: GitHubConfig;
  private initialized = false;

  constructor(config: GitHubConfig) {
    this.config = config;
    this.octokit = new Octokit({
      auth: config.token,
      userAgent: 'broken-loop-brewing-admin'
    });
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      // Test GitHub connection
      await this.testConnection();
      this.initialized = true;
      console.log('GitHub service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize GitHub service:', error);
      throw error;
    }
  }

  private async testConnection(): Promise<void> {
    try {
      await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      });
    } catch (error: any) {
      if (error.status === 401) {
        throw new Error('Invalid GitHub token');
      } else if (error.status === 404) {
        throw new Error(`Repository not found: ${this.config.owner}/${this.config.repo}`);
      } else {
        throw new Error(`GitHub connection failed: ${error.message}`);
      }
    }
  }

  async getFileContent(filePath: string): Promise<string | null> {
    await this.initialize();
    
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        ref: this.config.branch
      });

      if (Array.isArray(response.data)) {
        throw new Error(`Path is a directory: ${filePath}`);
      }

      if (response.data.type !== 'file') {
        throw new Error(`Path is not a file: ${filePath}`);
      }

      // Decode content
      const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
      return content;
    } catch (error: any) {
      if (error.status === 404) {
        return null; // File doesn't exist
      }
      throw error;
    }
  }

  async createFile(filePath: string, content: string, message: string): Promise<void> {
    await this.initialize();
    
    try {
      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message,
        content: Buffer.from(content).toString('base64'),
        branch: this.config.branch
      });
      
      console.log(`Created file: ${filePath}`);
    } catch (error: any) {
      console.error(`Failed to create file ${filePath}:`, error);
      throw new Error(`Failed to create file: ${error.message}`);
    }
  }

  async updateFile(filePath: string, content: string, message: string): Promise<void> {
    await this.initialize();
    
    try {
      // Get current file to get SHA
      const currentFile = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        ref: this.config.branch
      });

      if (Array.isArray(currentFile.data)) {
        throw new Error(`Path is a directory: ${filePath}`);
      }

      await this.octokit.repos.createOrUpdateFileContents({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message,
        content: Buffer.from(content).toString('base64'),
        sha: currentFile.data.sha,
        branch: this.config.branch
      });
      
      console.log(`Updated file: ${filePath}`);
    } catch (error: any) {
      if (error.status === 404) {
        // File doesn't exist, create it
        await this.createFile(filePath, content, message);
      } else {
        console.error(`Failed to update file ${filePath}:`, error);
        throw new Error(`Failed to update file: ${error.message}`);
      }
    }
  }

  async deleteFile(filePath: string, message: string): Promise<void> {
    await this.initialize();
    
    try {
      // Get current file to get SHA
      const currentFile = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        ref: this.config.branch
      });

      if (Array.isArray(currentFile.data)) {
        throw new Error(`Path is a directory: ${filePath}`);
      }

      await this.octokit.repos.deleteFile({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        message,
        sha: currentFile.data.sha,
        branch: this.config.branch
      });
      
      console.log(`Deleted file: ${filePath}`);
    } catch (error: any) {
      if (error.status === 404) {
        console.warn(`File already deleted: ${filePath}`);
        return;
      }
      console.error(`Failed to delete file ${filePath}:`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  async executeOperation(operation: FileOperation): Promise<void> {
    const fullPath = path.join(this.config.contentPath, operation.path);
    
    switch (operation.type) {
      case 'create':
        await this.createFile(fullPath, operation.content || '', operation.message);
        break;
      case 'update':
        await this.updateFile(fullPath, operation.content || '', operation.message);
        break;
      case 'delete':
        await this.deleteFile(fullPath, operation.message);
        break;
      default:
        throw new Error(`Unknown operation type: ${(operation as any).type}`);
    }
  }

  async executeBatchOperation(batch: BatchOperation): Promise<void> {
    await this.initialize();
    
    console.log(`Executing batch operation with ${batch.operations.length} operations`);
    
    // Execute operations sequentially to avoid rate limiting
    for (let i = 0; i < batch.operations.length; i++) {
      const operation = batch.operations[i];
      console.log(`Executing operation ${i + 1}/${batch.operations.length}: ${operation.type} ${operation.path}`);
      
      try {
        await this.executeOperation(operation);
        
        // Add small delay to avoid rate limiting
        if (i < batch.operations.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Failed to execute operation ${i + 1}:`, error);
        throw error;
      }
    }
    
    console.log('Batch operation completed successfully');
  }

  async syncLocalFiles(localContentPath: string): Promise<void> {
    await this.initialize();
    
    try {
      const files = await fs.readdir(localContentPath);
      const markdownFiles = files.filter(file => file.endsWith('.md'));
      
      console.log(`Found ${markdownFiles.length} local markdown files to sync`);
      
      for (const file of markdownFiles) {
        const localPath = path.join(localContentPath, file);
        const remotePath = path.join(this.config.contentPath, file);
        
        try {
          const content = await fs.readFile(localPath, 'utf-8');
          const remoteContent = await this.getFileContent(remotePath);
          
          if (remoteContent === null) {
            // File doesn't exist remotely, create it
            await this.createFile(
              remotePath,
              content,
              `Add beer: ${file.replace('.md', '')}`
            );
          } else if (remoteContent !== content) {
            // File exists but content is different, update it
            await this.updateFile(
              remotePath,
              content,
              `Update beer: ${file.replace('.md', '')}`
            );
          } else {
            console.log(`File ${file} is already in sync`);
          }
        } catch (error) {
          console.error(`Failed to sync file ${file}:`, error);
          throw error;
        }
      }
      
      console.log('Local files synced successfully');
    } catch (error) {
      console.error('Failed to sync local files:', error);
      throw error;
    }
  }

  async getLastCommit(): Promise<{ sha: string; message: string; date: string } | null> {
    await this.initialize();
    
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.branch,
        per_page: 1
      });

      if (response.data.length === 0) {
        return null;
      }

      const commit = response.data[0];
      return {
        sha: commit.sha,
        message: commit.commit.message,
        date: commit.commit.author?.date || ''
      };
    } catch (error) {
      console.error('Failed to get last commit:', error);
      return null;
    }
  }

  async getBranchInfo(): Promise<{ name: string; sha: string; protected: boolean } | null> {
    await this.initialize();
    
    try {
      const response = await this.octokit.repos.getBranch({
        owner: this.config.owner,
        repo: this.config.repo,
        branch: this.config.branch
      });

      return {
        name: response.data.name,
        sha: response.data.commit.sha,
        protected: response.data.protected || false
      };
    } catch (error) {
      console.error('Failed to get branch info:', error);
      return null;
    }
  }

  async createPullRequest(title: string, body: string, headBranch: string): Promise<string> {
    await this.initialize();
    
    try {
      const response = await this.octokit.pulls.create({
        owner: this.config.owner,
        repo: this.config.repo,
        title,
        body,
        head: headBranch,
        base: this.config.branch
      });

      return response.data.html_url;
    } catch (error: any) {
      console.error('Failed to create pull request:', error);
      throw new Error(`Failed to create pull request: ${error.message}`);
    }
  }

  async getRepositoryInfo(): Promise<{ name: string; description: string; url: string }> {
    await this.initialize();
    
    try {
      const response = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      });

      return {
        name: response.data.name,
        description: response.data.description || '',
        url: response.data.html_url
      };
    } catch (error) {
      console.error('Failed to get repository info:', error);
      throw error;
    }
  }

  async listDirectory(directoryPath: string): Promise<Array<{ name: string; type: 'file' | 'dir'; size: number; sha: string }>> {
    await this.initialize();
    
    try {
      const response = await this.octokit.repos.getContent({
        owner: this.config.owner,
        repo: this.config.repo,
        path: directoryPath,
        ref: this.config.branch
      });

      if (!Array.isArray(response.data)) {
        throw new Error(`Path is not a directory: ${directoryPath}`);
      }

      return response.data.map(item => ({
        name: item.name,
        type: item.type as 'file' | 'dir',
        size: item.size || 0,
        sha: item.sha
      }));
    } catch (error: any) {
      if (error.status === 404) {
        return []; // Directory doesn't exist or is empty
      }
      throw error;
    }
  }

  async createDirectory(directoryPath: string, message: string): Promise<void> {
    await this.initialize();
    
    try {
      // GitHub doesn't have directories per se, so we create a placeholder file
      const placeholderPath = `${directoryPath}/.gitkeep`;
      await this.createFile(placeholderPath, '', message);
      console.log(`Created directory: ${directoryPath}`);
    } catch (error) {
      console.error(`Failed to create directory ${directoryPath}:`, error);
      throw error;
    }
  }

  async moveFile(oldPath: string, newPath: string, message: string): Promise<void> {
    await this.initialize();
    
    try {
      // Get the content of the old file
      const content = await this.getFileContent(oldPath);
      if (content === null) {
        throw new Error(`Source file not found: ${oldPath}`);
      }

      // Create the file at the new location
      await this.createFile(newPath, content, `Move: ${oldPath} -> ${newPath}`);
      
      // Delete the old file
      await this.deleteFile(oldPath, message);
      
      console.log(`Moved file: ${oldPath} -> ${newPath}`);
    } catch (error) {
      console.error(`Failed to move file ${oldPath} -> ${newPath}:`, error);
      throw error;
    }
  }

  async copyFile(sourcePath: string, targetPath: string, message: string): Promise<void> {
    await this.initialize();
    
    try {
      const content = await this.getFileContent(sourcePath);
      if (content === null) {
        throw new Error(`Source file not found: ${sourcePath}`);
      }

      await this.createFile(targetPath, content, message);
      console.log(`Copied file: ${sourcePath} -> ${targetPath}`);
    } catch (error) {
      console.error(`Failed to copy file ${sourcePath} -> ${targetPath}:`, error);
      throw error;
    }
  }

  async searchFiles(query: string, path?: string): Promise<Array<{ name: string; path: string; score: number }>> {
    await this.initialize();
    
    try {
      const searchQuery = path ? `${query} path:${path}` : query;
      const response = await this.octokit.search.code({
        q: `${searchQuery} repo:${this.config.owner}/${this.config.repo}`,
        per_page: 100
      });

      return response.data.items.map(item => ({
        name: item.name,
        path: item.path,
        score: item.score
      }));
    } catch (error) {
      console.error('Failed to search files:', error);
      return [];
    }
  }

  async getFileHistory(filePath: string, limit: number = 10): Promise<Array<{ sha: string; message: string; date: string; author: string }>> {
    await this.initialize();
    
    try {
      const response = await this.octokit.repos.listCommits({
        owner: this.config.owner,
        repo: this.config.repo,
        path: filePath,
        per_page: limit
      });

      return response.data.map(commit => ({
        sha: commit.sha,
        message: commit.commit.message,
        date: commit.commit.author?.date || '',
        author: commit.commit.author?.name || 'Unknown'
      }));
    } catch (error) {
      console.error(`Failed to get file history for ${filePath}:`, error);
      return [];
    }
  }

  async createBranch(branchName: string, fromBranch?: string): Promise<void> {
    await this.initialize();
    
    try {
      const sourceBranch = fromBranch || this.config.branch;
      
      // Get the SHA of the source branch
      const sourceRef = await this.octokit.git.getRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${sourceBranch}`
      });

      // Create the new branch
      await this.octokit.git.createRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `refs/heads/${branchName}`,
        sha: sourceRef.data.object.sha
      });

      console.log(`Created branch: ${branchName} from ${sourceBranch}`);
    } catch (error: any) {
      if (error.status === 422) {
        console.warn(`Branch ${branchName} already exists`);
      } else {
        console.error(`Failed to create branch ${branchName}:`, error);
        throw error;
      }
    }
  }

  async deleteBranch(branchName: string): Promise<void> {
    await this.initialize();
    
    try {
      await this.octokit.git.deleteRef({
        owner: this.config.owner,
        repo: this.config.repo,
        ref: `heads/${branchName}`
      });

      console.log(`Deleted branch: ${branchName}`);
    } catch (error) {
      console.error(`Failed to delete branch ${branchName}:`, error);
      throw error;
    }
  }

  async validateRepository(): Promise<{ isValid: boolean; errors: string[]; warnings: string[] }> {
    await this.initialize();
    
    const errors: string[] = [];
    const warnings: string[] = [];

    try {
      // Check repository access
      const repo = await this.octokit.repos.get({
        owner: this.config.owner,
        repo: this.config.repo
      });

      // Check if repository is private (might affect API limits)
      if (repo.data.private) {
        warnings.push('Repository is private - ensure token has appropriate permissions');
      }

      // Check branch exists
      try {
        await this.octokit.repos.getBranch({
          owner: this.config.owner,
          repo: this.config.repo,
          branch: this.config.branch
        });
      } catch (branchError: any) {
        if (branchError.status === 404) {
          errors.push(`Branch '${this.config.branch}' does not exist`);
        }
      }

      // Check content path exists
      try {
        await this.octokit.repos.getContent({
          owner: this.config.owner,
          repo: this.config.repo,
          path: this.config.contentPath,
          ref: this.config.branch
        });
      } catch (pathError: any) {
        if (pathError.status === 404) {
          warnings.push(`Content path '${this.config.contentPath}' does not exist - it will be created when needed`);
        }
      }

    } catch (error: any) {
      if (error.status === 401) {
        errors.push('Invalid or expired GitHub token');
      } else if (error.status === 404) {
        errors.push(`Repository not found: ${this.config.owner}/${this.config.repo}`);
      } else {
        errors.push(`Repository validation failed: ${error.message}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
}
