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
}
