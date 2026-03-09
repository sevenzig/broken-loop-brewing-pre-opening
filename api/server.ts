import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { BeerRepository } from './db/repositories/BeerRepository';
import { FoodRepository } from './db/repositories/FoodRepository';
import { EventRepository } from './db/repositories/EventRepository';
import { getDropdownOptionsForForm } from './lib/utils/dropdowns';
import type { BeerSearchParams } from './lib/types/Beer';
import type { FoodSearchParams } from './db/repositories/FoodRepository';
import type { EventSearchParams } from './db/repositories/EventRepository';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const beerRepo = new BeerRepository();
const foodRepo = new FoodRepository();
const eventRepo = new EventRepository();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ---------------------------------------------------------------------------
// Auth middleware (lightweight -- checks for Bearer token presence)
// ---------------------------------------------------------------------------
function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }
  next();
}

// ---------------------------------------------------------------------------
// Health check
// ---------------------------------------------------------------------------
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString(), version: '2.0.0' });
});

// ===========================================================================
//  PUBLIC BEER ENDPOINTS
// ===========================================================================

app.get('/api/beers', async (req: Request, res: Response) => {
  try {
    const params: BeerSearchParams = {
      status: req.query.status as BeerSearchParams['status'],
      style: req.query.style as string,
      availability: req.query.availability as BeerSearchParams['availability'],
      search: req.query.search as string,
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 50,
      sortBy: (req.query.sortBy as BeerSearchParams['sortBy']) || 'name',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    };

    const result = await beerRepo.findAll(params);
    res.json({
      beers: result.beers,
      total: result.total,
      page: params.page,
      limit: params.limit,
    });
  } catch (error) {
    console.error('Beers API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/beers/:slug', async (req: Request, res: Response) => {
  try {
    const beer = await beerRepo.findBySlug(req.params.slug as string);
    if (!beer) {
      return res.status(404).json({ error: 'Beer not found' });
    }
    res.json({ beer });
  } catch (error) {
    console.error('Beer detail API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================================================
//  ADMIN BEER ENDPOINTS
// ===========================================================================

app.get('/api/admin/beers', requireAuth, async (req: Request, res: Response) => {
  try {
    const params: BeerSearchParams = {
      status: req.query.status as BeerSearchParams['status'],
      style: req.query.style as string,
      availability: req.query.availability as BeerSearchParams['availability'],
      search: req.query.search as string,
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 50,
      sortBy: (req.query.sortBy as BeerSearchParams['sortBy']) || 'name',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    };

    const result = await beerRepo.findAll(params);
    const stats = await beerRepo.getStats();

    res.json({
      success: true,
      data: {
        beers: result.beers,
        total: result.total,
        page: params.page,
        limit: params.limit,
        stats,
      },
    });
  } catch (error) {
    console.error('Admin beers API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/admin/beers/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const beer = await beerRepo.findByUuid(req.params.id as string);
    if (!beer) {
      return res.status(404).json({ success: false, error: 'Beer not found' });
    }
    res.json({ success: true, data: beer });
  } catch (error) {
    console.error('Admin beer detail error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/admin/beers', requireAuth, async (req: Request, res: Response) => {
  try {
    const beer = await beerRepo.create(req.body);
    res.status(201).json({ success: true, data: beer });
  } catch (error) {
    console.error('Admin beer create error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/beers/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const beer = await beerRepo.update(req.params.id as string, req.body);
    if (!beer) {
      return res.status(404).json({ success: false, error: 'Beer not found' });
    }
    res.json({ success: true, data: beer });
  } catch (error) {
    console.error('Admin beer update error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

app.delete('/api/admin/beers/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await beerRepo.delete(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Beer not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Admin beer delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ===========================================================================
//  PUBLIC FOOD ENDPOINTS
// ===========================================================================

app.get('/api/food', async (req: Request, res: Response) => {
  try {
    const params: FoodSearchParams = {
      category: req.query.category as string,
      search: req.query.search as string,
      available: req.query.available === 'true' ? true : req.query.available === 'false' ? false : undefined,
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 50,
      sortBy: (req.query.sortBy as string) || 'name',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    };

    const result = await foodRepo.findAll(params);
    res.json({
      food: result.food,
      total: result.total,
      page: params.page,
      limit: params.limit,
    });
  } catch (error) {
    console.error('Food API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/food/:slug', async (req: Request, res: Response) => {
  try {
    const foodItem = await foodRepo.findBySlug(req.params.slug as string);
    if (!foodItem) {
      return res.status(404).json({ error: 'Food item not found' });
    }
    res.json({ food: foodItem });
  } catch (error) {
    console.error('Food detail API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================================================
//  ADMIN FOOD ENDPOINTS
// ===========================================================================

app.get('/api/admin/food', requireAuth, async (req: Request, res: Response) => {
  try {
    const params: FoodSearchParams = {
      category: req.query.category as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 50,
      sortBy: (req.query.sortBy as string) || 'name',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    };

    const result = await foodRepo.findAll(params);
    const stats = await foodRepo.getStats();

    res.json({
      success: true,
      data: {
        food: result.food,
        total: result.total,
        page: params.page,
        limit: params.limit,
        stats,
      },
    });
  } catch (error) {
    console.error('Admin food API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/admin/food/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const food = await foodRepo.findByUuid(req.params.id as string);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }
    res.json({ success: true, data: food });
  } catch (error) {
    console.error('Admin food detail error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/admin/food', requireAuth, async (req: Request, res: Response) => {
  try {
    const food = await foodRepo.create(req.body);
    res.status(201).json({ success: true, data: food });
  } catch (error) {
    console.error('Admin food create error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/food/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const food = await foodRepo.update(req.params.id as string, req.body);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }
    res.json({ success: true, data: food });
  } catch (error) {
    console.error('Admin food update error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

app.delete('/api/admin/food/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await foodRepo.delete(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Food item not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Admin food delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ===========================================================================
//  PUBLIC EVENT ENDPOINTS
// ===========================================================================

app.get('/api/events', async (req: Request, res: Response) => {
  try {
    const params: EventSearchParams = {
      status: req.query.status as string,
      category: req.query.category as string,
      search: req.query.search as string,
      upcoming: req.query.upcoming === 'true',
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 50,
      sortBy: (req.query.sortBy as string) || 'date',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'asc',
    };

    const result = await eventRepo.findAll(params);
    res.json({
      events: result.events,
      total: result.total,
      page: params.page,
      limit: params.limit,
    });
  } catch (error) {
    console.error('Events API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/events/:slug', async (req: Request, res: Response) => {
  try {
    const event = await eventRepo.findBySlug(req.params.slug as string);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    res.json({ event });
  } catch (error) {
    console.error('Event detail API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ===========================================================================
//  ADMIN EVENT ENDPOINTS
// ===========================================================================

app.get('/api/admin/events', requireAuth, async (req: Request, res: Response) => {
  try {
    const params: EventSearchParams = {
      status: req.query.status as string,
      category: req.query.category as string,
      search: req.query.search as string,
      page: parseInt(req.query.page as string, 10) || 1,
      limit: parseInt(req.query.limit as string, 10) || 50,
      sortBy: (req.query.sortBy as string) || 'date',
      sortOrder: (req.query.sortOrder as 'asc' | 'desc') || 'desc',
    };

    const result = await eventRepo.findAll(params);
    const stats = await eventRepo.getStats();

    res.json({
      success: true,
      data: {
        events: result.events,
        total: result.total,
        page: params.page,
        limit: params.limit,
        stats,
      },
    });
  } catch (error) {
    console.error('Admin events API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/admin/events/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const event = await eventRepo.findByUuid(req.params.id as string);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Admin event detail error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.post('/api/admin/events', requireAuth, async (req: Request, res: Response) => {
  try {
    const event = await eventRepo.create(req.body);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error('Admin event create error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

app.put('/api/admin/events/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const event = await eventRepo.update(req.params.id as string, req.body);
    if (!event) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true, data: event });
  } catch (error) {
    console.error('Admin event update error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    res.status(500).json({ success: false, error: message });
  }
});

app.delete('/api/admin/events/:id', requireAuth, async (req: Request, res: Response) => {
  try {
    const deleted = await eventRepo.delete(req.params.id as string);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Event not found' });
    }
    res.json({ success: true });
  } catch (error) {
    console.error('Admin event delete error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ===========================================================================
//  ADMIN METADATA (aggregated stats + dropdown options)
// ===========================================================================

app.get('/api/admin/metadata', requireAuth, async (req: Request, res: Response) => {
  try {
    const [beerStats, foodStats, eventStats] = await Promise.all([
      beerRepo.getStats(),
      foodRepo.getStats(),
      eventRepo.getStats(),
    ]);

    const dropdowns = getDropdownOptionsForForm();

    res.json({
      success: true,
      data: {
        dropdowns,
        beerStats,
        foodStats,
        eventStats,
        systemInfo: {
          version: '2.0.0',
          environment: process.env.NODE_ENV || 'development',
          dbConnected: true,
        },
      },
    });
  } catch (error) {
    console.error('Admin metadata API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

app.get('/api/admin/metadata-simple', requireAuth, async (req: Request, res: Response) => {
  try {
    const beerStats = await beerRepo.getStats();
    const dropdowns = getDropdownOptionsForForm();

    res.json({
      success: true,
      data: {
        dropdowns,
        stats: beerStats,
        systemInfo: {
          version: '2.0.0',
          environment: process.env.NODE_ENV || 'development',
          dbConnected: true,
        },
      },
    });
  } catch (error) {
    console.error('Admin metadata API error:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// ===========================================================================
//  BUSINESS STATUS
// ===========================================================================

app.get('/api/business-status', (_req: Request, res: Response) => {
  const status = {
    isOpen: true,
    message: 'We are open!',
    hours: {
      monday: '11:00 AM - 10:00 PM',
      tuesday: '11:00 AM - 10:00 PM',
      wednesday: '11:00 AM - 10:00 PM',
      thursday: '11:00 AM - 10:00 PM',
      friday: '11:00 AM - 11:00 PM',
      saturday: '10:00 AM - 11:00 PM',
      sunday: '10:00 AM - 9:00 PM',
    },
  };
  res.json({ success: true, data: status });
});

// ===========================================================================
//  STATIC FILE SERVING (production / Docker)
// ===========================================================================

const staticDir = process.env.STATIC_DIR || path.join(__dirname, '..', 'dist');

if (process.env.SERVE_STATIC === 'true') {
  app.use(express.static(staticDir, { index: 'index.html' }));

  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(staticDir, 'index.html'));
  });
}

// ===========================================================================
//  START SERVER
// ===========================================================================

const startServer = async () => {
  try {
    console.log('Starting Broken Loop Brewing API v2.0.0 (DB-backed)...');

    if (!process.env.DATABASE_URL) {
      console.warn(
        'WARNING: DATABASE_URL is not set. DB endpoints will fail. ' +
        'Set DATABASE_URL to a PostgreSQL connection string.'
      );
    }

    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}`);
      console.log(`  Beers API:  http://localhost:${PORT}/api/beers`);
      console.log(`  Food API:   http://localhost:${PORT}/api/food`);
      console.log(`  Events API: http://localhost:${PORT}/api/events`);
      console.log(`  Admin:      http://localhost:${PORT}/api/admin/beers`);
      console.log(`  Health:     http://localhost:${PORT}/api/health`);
      if (process.env.SERVE_STATIC === 'true') {
        console.log(`  Frontend:   http://localhost:${PORT}/`);
      }
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

process.on('SIGINT', () => {
  console.log('\nShutting down Express server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\nShutting down Express server...');
  process.exit(0);
});

startServer();
