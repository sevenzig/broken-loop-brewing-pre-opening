import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Content-Type', 'application/json');

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    const { uuid } = req.query;

    if (!uuid || typeof uuid !== 'string') {
      res.status(400).json({ error: 'UUID parameter is required' });
      return;
    }

    if (req.method === 'GET') {
      // Use require to avoid bundling issues in Vercel
      const fs = require('fs');
      const path = require('path');
      
      // Read beers data from the built JSON file
      const beersPath = path.join(process.cwd(), 'public', 'data', 'beers.json');
      const beersData = JSON.parse(fs.readFileSync(beersPath, 'utf8'));
      
      // Find the specific beer by UUID
      const beer = beersData.find((b: any) => b.uuid === uuid);
      
      if (!beer) {
        res.status(404).json({ error: 'Beer not found' });
        return;
      }

      res.status(200).json({ beer });
    } else {
      res.setHeader('Allow', ['GET', 'OPTIONS']);
      res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    
    if (error instanceof Error) {
      res.status(500).json({ error: 'Internal server error' });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
}
