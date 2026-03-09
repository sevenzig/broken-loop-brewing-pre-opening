import { Router, Request, Response } from 'express';
import { ContentManagerService } from '../services/ContentManagerService';
import { GitHubService } from '../services/GitHubService';
import { ValidationService } from '../services/ValidationService';
import { ConflictResolutionService } from '../services/ConflictResolutionService';
import type { 
  ContentType, 
  ContentCRUDOptions,
  ContentSearchParams,
  BatchContentOperation,
  BeerContent,
  FoodContent,
  EventContent
} from '../types/ContentManager';

const router = Router();

// Initialize services
const githubService = new GitHubService({
  token: process.env.GITHUB_TOKEN || '',
  owner: process.env.GITHUB_OWNER || '',
  repo: process.env.GITHUB_REPO || '',
  branch: process.env.GITHUB_BRANCH || 'main',
  contentPath: process.env.GITHUB_CONTENT_PATH || 'src/data'
});

const validationService = new ValidationService();
const conflictService = new ConflictResolutionService();
const contentManager = new ContentManagerService(githubService, validationService, conflictService);

// Middleware for authentication (you'll need to implement this based on your auth system)
const requireAuth = (req: Request, res: Response, next: Function) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }
  // Add your JWT verification logic here
  next();
};

// GET /content/:type - List content items
router.get('/:type', async (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContentType;
    const params: ContentSearchParams = {
      search: req.query.search as string,
      status: req.query.status as string,
      tags: req.query.tags ? (req.query.tags as string).split(',') : undefined,
      category: req.query.category as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
      sortBy: req.query.sortBy as string,
      sortOrder: req.query.sortOrder as 'asc' | 'desc'
    };

    const result = await contentManager.listContent(type, params);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('List content error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// GET /content/:type/:id - Get single content item
router.get('/:type/:id', async (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContentType;
    const id = req.params.id as string;
    const validate = req.query.validate === 'true';

    const item = await contentManager.getContent(type, id, { validate });
    
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Get content error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error'
    });
  }
});

// POST /content/:type - Create new content item
router.post('/:type', requireAuth, async (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContentType;
    const data = req.body;
    
    const options: ContentCRUDOptions = {
      validate: req.body.validate !== false,
      commitMessage: req.body.commitMessage,
      conflictResolution: req.body.conflictResolution
    };

    const item = await contentManager.createContent(type, data, options);
    
    res.status(201).json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Create content error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bad request'
    });
  }
});

// PUT /content/:type/:id - Update content item
router.put('/:type/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContentType;
    const id = req.params.id as string;
    const updates = req.body;
    
    const options: ContentCRUDOptions = {
      validate: req.body.validate !== false,
      commitMessage: req.body.commitMessage,
      conflictResolution: req.body.conflictResolution
    };

    const item = await contentManager.updateContent(type, id, updates, options);
    
    res.json({
      success: true,
      data: item
    });
  } catch (error) {
    console.error('Update content error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bad request'
    });
  }
});

// DELETE /content/:type/:id - Delete content item
router.delete('/:type/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContentType;
    const id = req.params.id as string;
    
    const options: ContentCRUDOptions = {
      commitMessage: req.body.commitMessage || `Delete ${type}: ${id}`
    };

    await contentManager.deleteContent(type, id, options);
    
    res.json({
      success: true,
      message: `${type} deleted successfully`
    });
  } catch (error) {
    console.error('Delete content error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Bad request'
    });
  }
});

// POST /content/batch - Execute batch operations
router.post('/batch', requireAuth, async (req: Request, res: Response) => {
  try {
    const batchOperation: BatchContentOperation = req.body;
    
    await contentManager.executeBatchOperation(batchOperation);
    
    res.json({
      success: true,
      message: 'Batch operation completed successfully'
    });
  } catch (error) {
    console.error('Batch operation error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Batch operation failed'
    });
  }
});

// POST /content/:type/:id/validate - Validate content item
router.post('/:type/:id/validate', async (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContentType;
    const id = req.params.id as string;

    const item = await contentManager.getContent(type, id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    const validation = await validationService.validateContent(item);
    
    res.json({
      success: true,
      data: validation
    });
  } catch (error) {
    console.error('Validate content error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Validation failed'
    });
  }
});

// GET /content/:type/:id/conflicts/:other - Check for conflicts
router.get('/:type/:id/conflicts/:other', async (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContentType;
    const id = req.params.id as string;
    const otherId = req.params.other as string;

    const [existing, other] = await Promise.all([
      contentManager.getContent(type, id),
      contentManager.getContent(type, otherId)
    ]);

    if (!existing || !other) {
      return res.status(404).json({
        success: false,
        error: 'One or both content items not found'
      });
    }

    const analysis = await conflictService.detectConflicts(existing, other);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Conflict analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Conflict analysis failed'
    });
  }
});

// POST /content/:type/:id/resolve-conflicts - Resolve conflicts
router.post('/:type/:id/resolve-conflicts', requireAuth, async (req: Request, res: Response) => {
  try {
    const type = req.params.type as ContentType;
    const id = req.params.id as string;
    const { otherContent, strategy } = req.body;

    const existing = await contentManager.getContent(type, id);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: 'Content not found'
      });
    }

    const resolution = await conflictService.resolveConflict(existing, otherContent, strategy);
    
    res.json({
      success: true,
      data: resolution
    });
  } catch (error) {
    console.error('Conflict resolution error:', error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : 'Conflict resolution failed'
    });
  }
});

// GET /content/search - Global content search
router.get('/search', async (req: Request, res: Response) => {
  try {
    const query = req.query.q as string;
    const validTypes: ContentType[] = ['beer', 'food', 'event'];
    const types = req.query.types 
      ? (req.query.types as string).split(',').filter((type): type is ContentType => validTypes.includes(type as ContentType))
      : validTypes;
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 50;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const results = await Promise.all(
      types.map(async (type) => {
        const result = await contentManager.listContent(type, {
          search: query,
          limit
        });
        return {
          type,
          items: result.items,
          total: result.total
        };
      })
    );

    const totalResults = results.reduce((sum, result) => sum + result.total, 0);
    const allItems = results.flatMap(result => result.items);

    res.json({
      success: true,
      data: {
        query,
        total: totalResults,
        results,
        items: allItems.slice(0, limit)
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Search failed'
    });
  }
});

// GET /content/stats - Get content statistics
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const types: ContentType[] = ['beer', 'food', 'event'];
    const stats = await Promise.all(
      types.map(async (type) => {
        const result = await contentManager.listContent(type, { limit: 1000 });
        return {
          type,
          total: result.total,
          items: result.items
        };
      })
    );

    const totalItems = stats.reduce((sum, stat) => sum + stat.total, 0);
    const itemsByType = stats.reduce((acc, stat) => {
      acc[stat.type] = stat.total;
      return acc;
    }, {} as Record<ContentType, number>);

    const allItems = stats.flatMap(stat => stat.items);
    const recentlyModified = allItems
      .sort((a, b) => new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime())
      .slice(0, 10);

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const createdThisMonth = allItems.filter(item => 
      new Date(item.metadata.created_at) >= thisMonth
    ).length;

    const updatedThisWeek = allItems.filter(item => 
      new Date(item.lastModified) >= thisWeek
    ).length;

    res.json({
      success: true,
      data: {
        totalItems,
        itemsByType,
        recentlyModified,
        createdThisMonth,
        updatedThisWeek
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to get statistics'
    });
  }
});

export default router;