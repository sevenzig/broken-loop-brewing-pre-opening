import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    // Return mock beer data
    const mockBeers = [
      {
        id: 'hoppy-trails-ipa',
        name: 'Hoppy Trails IPA',
        style: 'American IPA',
        abv: 6.5,
        ibu: 65,
        status: 'on-tap',
        availability: 'available'
      },
      {
        id: 'midnight-stout',
        name: 'Midnight Stout',
        style: 'American Stout',
        abv: 7.2,
        ibu: 45,
        status: 'on-tap',
        availability: 'available'
      },
      {
        id: 'golden-wheat',
        name: 'Golden Wheat',
        style: 'American Wheat',
        abv: 5.0,
        ibu: 20,
        status: 'on-tap',
        availability: 'available'
      }
    ];

    const result = {
      beers: mockBeers,
      pagination: {
        page: 1,
        limit: 50,
        total: mockBeers.length,
        totalPages: 1
      },
      filters: {
        status: req.query.status || null,
        style: req.query.style || null,
        availability: req.query.availability || null,
        search: req.query.search || null
      }
    };

    res.status(200).json({
      success: true,
      data: result
    });
  } else {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }
}
