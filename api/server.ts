import express from 'express';
import cors from 'cors';
import { AdminService } from './lib/services/AdminService';
import { BeerService } from './lib/services/BeerService';
import { getDropdownOptionsForForm } from './lib/utils/dropdowns';
import contentRoutes from './lib/routes/contentRoutes';
import type { BeerSearchParams } from './lib/types/Beer';

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize services
const adminService = new AdminService();
const beerService = new BeerService();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Routes
app.use('/api/content', contentRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Admin APIs
app.get('/api/admin/beers', async (req, res) => {
  try {
    const {
      status,
      style,
      availability,
      search,
      page = '1',
      limit = '50',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const params: BeerSearchParams = {
      status: status as any,
      style: style as string,
      availability: availability as any,
      search: search as string,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    const result = await adminService.getBeerList(params);
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Admin beers API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

app.get('/api/admin/metadata-simple', async (req, res) => {
  try {
    const metadata = await adminService.getMetadata();
    
    res.json({
      success: true,
      data: metadata
    });
  } catch (error) {
    console.error('Admin metadata API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Public Beer APIs
app.get('/api/beers', async (req, res) => {
  try {
    const {
      status,
      style,
      availability,
      search,
      page = '1',
      limit = '50',
      sortBy = 'name',
      sortOrder = 'asc'
    } = req.query;

    const params: BeerSearchParams = {
      status: status as any,
      style: style as string,
      availability: availability as any,
      search: search as string,
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      sortBy: sortBy as any,
      sortOrder: sortOrder as 'asc' | 'desc'
    };

    await beerService.initialize();
    const result = await beerService.searchBeers(params);
    
    res.json(result);
  } catch (error) {
    console.error('Beers API error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

app.get('/api/beers/:uuid', async (req, res) => {
  try {
    const { uuid } = req.params;
    
    if (!uuid) {
      return res.status(400).json({ error: 'UUID parameter is required' });
    }

    await beerService.initialize();
    const beer = await beerService.getBeerByUUID(uuid);
    
    if (!beer) {
      return res.status(404).json({ error: 'Beer not found' });
    }

    res.json({ beer });
  } catch (error) {
    console.error('Beer detail API error:', error);
    res.status(500).json({
      error: 'Internal server error'
    });
  }
});

// Business Status API
app.get('/api/business-status', async (req, res) => {
  try {
    // Simple business status - always open for now
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
        sunday: '10:00 AM - 9:00 PM'
      }
    };
    
    res.json({ 
      success: true, 
      data: status 
    });
  } catch (error) {
    console.error('Business status API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Initialize services and start server
const startServer = async () => {
  try {
    console.log('Initializing services...');
    await Promise.all([
      adminService.initialize(),
      beerService.initialize()
    ]);
    
    app.listen(PORT, () => {
      console.log(`🚀 Express API server running on port ${PORT}`);
      console.log(`📡 Admin API: http://localhost:${PORT}/api/admin/beers`);
      console.log(`🍺 Beers API: http://localhost:${PORT}/api/beers`);
      console.log(`💚 Health: http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down Express server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down Express server...');
  process.exit(0);
});

// Start the server
startServer();
