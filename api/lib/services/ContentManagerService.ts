import { GitHubService } from './GitHubService';
import { ValidationService } from './ValidationService';
import { ConflictResolutionService } from './ConflictResolutionService';
import matter from 'gray-matter';
import slugify from 'slugify';
import { v4 as uuidv4 } from 'uuid';
import type { 
  ContentType, 
  ContentItem, 
  ContentCRUDOptions,
  ContentValidationResult,
  ContentConflictResolution,
  BatchContentOperation,
  ContentSearchParams,
  ContentSearchResult 
} from '../types/ContentManager';

export class ContentManagerService {
  private githubService: GitHubService;
  private validationService: ValidationService;
  private conflictService: ConflictResolutionService;
  private initialized = false;

  constructor(
    githubService: GitHubService,
    validationService?: ValidationService,
    conflictService?: ConflictResolutionService
  ) {
    this.githubService = githubService;
    this.validationService = validationService || new ValidationService();
    this.conflictService = conflictService || new ConflictResolutionService();
  }

  async initialize(): Promise<void> {
    if (this.initialized) return;
    
    try {
      await Promise.all([
        this.githubService.initialize(),
        this.validationService.initialize(),
        this.conflictService.initialize()
      ]);
      
      this.initialized = true;
      console.log('ContentManagerService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ContentManagerService:', error);
      throw error;
    }
  }

  // READ Operations
  async getContent<T extends ContentItem>(
    type: ContentType,
    id: string,
    options: ContentCRUDOptions = {}
  ): Promise<T | null> {
    await this.initialize();
    
    try {
      const filePath = this.buildFilePath(type, id);
      const content = await this.githubService.getFileContent(filePath);
      
      if (!content) {
        return null;
      }

      const parsed = matter(content);
      const contentItem: ContentItem = {
        id,
        type,
        slug: parsed.data.slug || slugify(parsed.data.name || id),
        metadata: parsed.data,
        content: parsed.content,
        lastModified: new Date().toISOString(),
        filePath,
        version: this.generateVersion(content)
      };

      if (options.validate) {
        const validation = await this.validationService.validateContent(contentItem);
        if (!validation.isValid) {
          console.warn(`Content validation failed for ${id}:`, validation.errors);
        }
      }

      return contentItem as T;
    } catch (error) {
      console.error(`Failed to get content ${type}/${id}:`, error);
      throw error;
    }
  }

  async listContent<T extends ContentItem>(
    type: ContentType,
    params: ContentSearchParams = {}
  ): Promise<ContentSearchResult<T>> {
    await this.initialize();
    
    try {
      const directoryPath = this.getContentDirectory(type);
      const files = await this.githubService.listDirectory(directoryPath);
      
      let items: T[] = [];
      
      // Load all content items
      for (const file of files.filter(f => f.name.endsWith('.md'))) {
        const id = file.name.replace('.md', '');
        const item = await this.getContent<T>(type, id, { validate: false });
        if (item) {
          items.push(item);
        }
      }

      // Apply filters
      if (params.search) {
        const searchTerm = params.search.toLowerCase();
        items = items.filter(item => 
          item.metadata.name?.toLowerCase().includes(searchTerm) ||
          item.content.toLowerCase().includes(searchTerm) ||
          item.metadata.brief_description?.toLowerCase().includes(searchTerm)
        );
      }

      if (params.status) {
        items = items.filter(item => item.metadata.status === params.status);
      }

      if (params.tags && params.tags.length > 0) {
        items = items.filter(item => {
          const itemTags = item.metadata.tags || [];
          return params.tags!.some(tag => itemTags.includes(tag));
        });
      }

      // Apply sorting
      const sortBy = params.sortBy || 'name';
      const sortOrder = params.sortOrder || 'asc';
      
      items.sort((a, b) => {
        const aVal = this.getSortValue(a, sortBy);
        const bVal = this.getSortValue(b, sortBy);
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });

      // Apply pagination
      const page = params.page || 1;
      const limit = params.limit || 50;
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedItems = items.slice(startIndex, endIndex);

      return {
        items: paginatedItems,
        total: items.length,
        page,
        limit,
        totalPages: Math.ceil(items.length / limit)
      };
    } catch (error) {
      console.error(`Failed to list content for type ${type}:`, error);
      throw error;
    }
  }

  // CREATE Operations
  async createContent<T extends ContentItem>(
    type: ContentType,
    data: Partial<T>,
    options: ContentCRUDOptions = {}
  ): Promise<T> {
    await this.initialize();
    
    try {
      // Generate ID if not provided
      const id = data.id || this.generateId(type, data.metadata?.name || 'untitled');
      
      // Build content item
      const contentItem: ContentItem = {
        id,
        type,
        slug: data.slug || slugify(data.metadata?.name || id),
        metadata: {
          ...this.getDefaultMetadata(type),
          ...data.metadata,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        content: data.content || this.getDefaultContent(type),
        lastModified: new Date().toISOString(),
        filePath: this.buildFilePath(type, id),
        version: '1'
      };

      // Validate content
      if (options.validate !== false) {
        const validation = await this.validationService.validateContent(contentItem);
        if (!validation.isValid) {
          throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Check for conflicts
      if (options.conflictResolution) {
        const existingContent = await this.getContent(type, id);
        if (existingContent) {
          const resolution = await this.conflictService.resolveConflict(
            existingContent,
            contentItem,
            options.conflictResolution
          );
          
          if (resolution.action === 'reject') {
            throw new Error(`Content creation rejected due to conflict: ${resolution.reason}`);
          }
        }
      }

      // Generate markdown
      const markdownContent = this.generateMarkdown(contentItem);
      
      // Create file in GitHub
      const commitMessage = options.commitMessage || `Create ${type}: ${contentItem.metadata.name}`;
      await this.githubService.createFile(contentItem.filePath, markdownContent, commitMessage);
      
      console.log(`Created ${type} content: ${id}`);
      return contentItem as T;
    } catch (error) {
      console.error(`Failed to create content ${type}:`, error);
      throw error;
    }
  }

  // UPDATE Operations
  async updateContent<T extends ContentItem>(
    type: ContentType,
    id: string,
    updates: Partial<T>,
    options: ContentCRUDOptions = {}
  ): Promise<T> {
    await this.initialize();
    
    try {
      // Get existing content
      const existingContent = await this.getContent<T>(type, id);
      if (!existingContent) {
        throw new Error(`Content not found: ${type}/${id}`);
      }

      // Merge updates
      const updatedContent: ContentItem = {
        ...existingContent,
        ...updates,
        metadata: {
          ...existingContent.metadata,
          ...updates.metadata,
          updated_at: new Date().toISOString()
        },
        lastModified: new Date().toISOString(),
        version: this.incrementVersion(existingContent.version)
      };

      // Validate content
      if (options.validate !== false) {
        const validation = await this.validationService.validateContent(updatedContent);
        if (!validation.isValid) {
          throw new Error(`Content validation failed: ${validation.errors.join(', ')}`);
        }
      }

      // Handle conflicts
      if (options.conflictResolution) {
        const currentRemoteContent = await this.getContent(type, id);
        if (currentRemoteContent && currentRemoteContent.version !== existingContent.version) {
          const resolution = await this.conflictService.resolveConflict(
            currentRemoteContent,
            updatedContent,
            options.conflictResolution
          );
          
          if (resolution.action === 'reject') {
            throw new Error(`Update rejected due to conflict: ${resolution.reason}`);
          } else if (resolution.action === 'merge') {
            Object.assign(updatedContent, resolution.mergedContent);
          }
        }
      }

      // Generate markdown
      const markdownContent = this.generateMarkdown(updatedContent);
      
      // Update file in GitHub
      const commitMessage = options.commitMessage || `Update ${type}: ${updatedContent.metadata.name}`;
      await this.githubService.updateFile(updatedContent.filePath, markdownContent, commitMessage);
      
      console.log(`Updated ${type} content: ${id}`);
      return updatedContent as T;
    } catch (error) {
      console.error(`Failed to update content ${type}/${id}:`, error);
      throw error;
    }
  }

  // DELETE Operations
  async deleteContent(
    type: ContentType,
    id: string,
    options: ContentCRUDOptions = {}
  ): Promise<void> {
    await this.initialize();
    
    try {
      // Get existing content for validation
      const existingContent = await this.getContent(type, id);
      if (!existingContent) {
        console.warn(`Content not found for deletion: ${type}/${id}`);
        return;
      }

      // Delete file from GitHub
      const filePath = this.buildFilePath(type, id);
      const commitMessage = options.commitMessage || `Delete ${type}: ${existingContent.metadata.name}`;
      await this.githubService.deleteFile(filePath, commitMessage);
      
      console.log(`Deleted ${type} content: ${id}`);
    } catch (error) {
      console.error(`Failed to delete content ${type}/${id}:`, error);
      throw error;
    }
  }

  // BATCH Operations
  async executeBatchOperation(operation: BatchContentOperation): Promise<void> {
    await this.initialize();
    
    try {
      console.log(`Executing batch operation with ${operation.operations.length} operations`);
      
      const results = [];
      
      // Execute operations sequentially to maintain data integrity
      for (let i = 0; i < operation.operations.length; i++) {
        const op = operation.operations[i];
        
        try {
          let result;
          
          switch (op.action) {
            case 'create':
              result = await this.createContent(op.type, op.data, op.options);
              break;
            case 'update':
              result = await this.updateContent(op.type, op.id!, op.data, op.options);
              break;
            case 'delete':
              await this.deleteContent(op.type, op.id!, op.options);
              result = { deleted: true };
              break;
            default:
              throw new Error(`Unknown batch operation: ${(op as any).action}`);
          }
          
          results.push({ success: true, result });
          
          // Add delay to avoid rate limiting
          if (i < operation.operations.length - 1) {
            await new Promise(resolve => setTimeout(resolve, operation.delayBetweenOperations || 100));
          }
        } catch (error) {
          console.error(`Batch operation ${i + 1} failed:`, error);
          results.push({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
          
          if (operation.stopOnFirstError) {
            throw error;
          }
        }
      }
      
      console.log(`Batch operation completed. Success: ${results.filter(r => r.success).length}, Failed: ${results.filter(r => !r.success).length}`);
    } catch (error) {
      console.error('Batch operation failed:', error);
      throw error;
    }
  }

  // Utility Methods
  private buildFilePath(type: ContentType, id: string): string {
    const directory = this.getContentDirectory(type);
    return `${directory}/${id}.md`;
  }

  private getContentDirectory(type: ContentType): string {
    const directories = {
      'beer': 'src/data/beers',
      'food': 'src/data/food',
      'event': 'src/data/events'
    };
    
    return directories[type] || `src/data/${type}s`;
  }

  private generateId(type: ContentType, name: string): string {
    const slug = slugify(name, { lower: true, strict: true });
    return `${slug}-${Date.now()}`;
  }

  private generateVersion(content: string): string {
    // Simple hash-based versioning
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private incrementVersion(version: string): string {
    return `${version}-${Date.now().toString(36)}`;
  }

  private generateMarkdown(item: ContentItem): string {
    const frontmatter = Object.keys(item.metadata)
      .sort()
      .reduce((acc, key) => {
        acc[key] = item.metadata[key];
        return acc;
      }, {} as any);

    return matter.stringify(item.content, frontmatter);
  }

  private getDefaultMetadata(type: ContentType): Record<string, any> {
    const defaults = {
      beer: {
        name: 'New Beer',
        slug: '',
        status: 'draft',
        availability: 'seasonal',
        abv: '0.0%',
        ibu: '0',
        style: 'Other'
      },
      food: {
        name: 'New Food Item',
        slug: '',
        category: 'appetizers',
        status: 'available',
        price: '0.00'
      },
      event: {
        name: 'New Event',
        slug: '',
        status: 'upcoming',
        date: new Date().toISOString().split('T')[0]
      }
    };
    
    return defaults[type] || {};
  }

  private getDefaultContent(type: ContentType): string {
    const templates = {
      beer: '# New Beer\n\nAdd your beer description here.',
      food: '# New Food Item\n\nAdd your food item description here.',
      event: '# New Event\n\nAdd your event description here.'
    };
    
    return templates[type] || '# New Content\n\nAdd your content here.';
  }

  private getSortValue(item: ContentItem, sortBy: string): any {
    if (sortBy === 'name') return item.metadata.name || '';
    if (sortBy === 'created_at') return item.metadata.created_at || '';
    if (sortBy === 'updated_at') return item.metadata.updated_at || '';
    if (sortBy === 'status') return item.metadata.status || '';
    return item.metadata[sortBy] || '';
  }
}