# GitHub CRUD System Setup Guide

## Quick Start

### 1. Environment Configuration

Create or update your `.env` file:

```bash
# Required - GitHub Integration
GITHUB_TOKEN=ghp_your_github_personal_access_token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repository-name
GITHUB_BRANCH=main
GITHUB_CONTENT_PATH=src/data

# Optional - Authentication
JWT_SECRET=your-jwt-secret-key

# Optional - Server Configuration
PORT=3001
NODE_ENV=production
```

### 2. GitHub Personal Access Token Setup

1. Go to GitHub Settings → Developer settings → Personal access tokens
2. Generate a new token with these permissions:
   - `repo` (Full control of private repositories)
   - `public_repo` (Access public repositories)
3. Copy the token and add it to your `.env` file

### 3. Install Dependencies

```bash
# API dependencies are already installed
cd api && npm install

# Main project dependencies
npm install
```

### 4. Test the System

```bash
# Start the API server
npm run dev:api

# Test health endpoint
curl http://localhost:3001/api/health

# Test content endpoint (should return existing beers)
curl http://localhost:3001/api/content/beer
```

## API Usage Examples

### Create a New Beer

```javascript
const newBeer = {
  metadata: {
    name: "Test IPA",
    slug: "test-ipa",
    abv: "6.0%",
    ibu: "45",
    style: "American IPA",
    status: "on-tap",
    availability: "seasonal",
    brief_description: "A test IPA for the CRUD system"
  },
  content: "# Test IPA\n\nThis is a test beer created through the CRUD API."
};

// POST /api/content/beer
fetch('http://localhost:3001/api/content/beer', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token' // If auth is enabled
  },
  body: JSON.stringify(newBeer)
});
```

### List Beers with Filtering

```javascript
// Get all on-tap IPAs, sorted by name
fetch('http://localhost:3001/api/content/beer?status=on-tap&style=IPA&sortBy=name');

// Search for "stout" in beer names and descriptions
fetch('http://localhost:3001/api/content/beer?search=stout');

// Get page 2 with 10 items per page
fetch('http://localhost:3001/api/content/beer?page=2&limit=10');
```

### Update Existing Content

```javascript
const updates = {
  metadata: {
    status: "seasonal",
    brief_description: "Updated description"
  }
};

// PUT /api/content/beer/existing-beer-id
fetch('http://localhost:3001/api/content/beer/hazy-horizon-ipa', {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify(updates)
});
```

### Batch Operations

```javascript
const batchOp = {
  operations: [
    {
      action: 'update',
      type: 'beer',
      id: 'hoppy-trails-ipa',
      data: { metadata: { status: 'archived' } }
    },
    {
      action: 'create',
      type: 'food',
      data: {
        metadata: {
          name: "New Appetizer",
          category: "appetizers",
          status: "available",
          price: "$8.99"
        },
        content: "# New Appetizer\n\nDelicious new appetizer!"
      }
    }
  ]
};

fetch('http://localhost:3001/api/content/batch', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer your-jwt-token'
  },
  body: JSON.stringify(batchOp)
});
```

## Frontend Integration

### React Example

```jsx
import { useState, useEffect } from 'react';

function BeerList() {
  const [beers, setBeers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBeers() {
      try {
        const response = await fetch('/api/content/beer?status=on-tap');
        const data = await response.json();
        if (data.success) {
          setBeers(data.data.items);
        }
      } catch (error) {
        console.error('Failed to fetch beers:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchBeers();
  }, []);

  if (loading) return <div>Loading beers...</div>;

  return (
    <div>
      <h2>On Tap Beers</h2>
      {beers.map(beer => (
        <div key={beer.id}>
          <h3>{beer.metadata.name}</h3>
          <p>{beer.metadata.brief_description}</p>
          <p>ABV: {beer.metadata.abv} | IBU: {beer.metadata.ibu}</p>
        </div>
      ))}
    </div>
  );
}
```

### Vue.js Example

```vue
<template>
  <div>
    <h2>Food Menu</h2>
    <div v-if="loading">Loading menu...</div>
    <div v-else>
      <div v-for="category in groupedFood" :key="category.name">
        <h3>{{ category.name }}</h3>
        <div v-for="item in category.items" :key="item.id">
          <h4>{{ item.metadata.name }} - {{ item.metadata.price }}</h4>
          <p>{{ item.metadata.brief_description }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      foodItems: [],
      loading: true
    };
  },
  computed: {
    groupedFood() {
      const groups = {};
      this.foodItems.forEach(item => {
        const category = item.metadata.category;
        if (!groups[category]) {
          groups[category] = { name: category, items: [] };
        }
        groups[category].items.push(item);
      });
      return Object.values(groups);
    }
  },
  async mounted() {
    try {
      const response = await fetch('/api/content/food?status=available');
      const data = await response.json();
      if (data.success) {
        this.foodItems = data.data.items;
      }
    } catch (error) {
      console.error('Failed to fetch food items:', error);
    } finally {
      this.loading = false;
    }
  }
};
</script>
```

## Validation Examples

### Custom Validation Rules

```javascript
// Add custom validation for beer ABV
validationService.addValidationRule('beer', 'abv', {
  type: 'custom',
  validator: (value, fieldName) => {
    const abv = parseFloat(value?.replace('%', '') || '0');
    if (abv < 0 || abv > 20) {
      return { isValid: false, message: 'ABV must be between 0% and 20%' };
    }
    return { isValid: true, message: '' };
  },
  level: 'error'
});

// Add custom validation for event dates
validationService.addValidationRule('event', 'date', {
  type: 'custom',
  validator: (value, fieldName) => {
    const eventDate = new Date(value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (eventDate < today) {
      return { isValid: false, message: 'Event date cannot be in the past' };
    }
    return { isValid: true, message: '' };
  },
  level: 'warning'
});
```

## Troubleshooting

### Common Issues

1. **"Authentication failed" error**
   - Check your GitHub token is valid and has correct permissions
   - Verify the token isn't expired
   - Ensure repository exists and is accessible

2. **"Validation failed" errors**
   - Check required fields are present
   - Verify field formats match expected patterns
   - Review validation error messages for specifics

3. **"Content not found" errors**
   - Verify the content ID/slug exists
   - Check file exists in the GitHub repository
   - Ensure the content path is correct

4. **Rate limiting issues**
   - GitHub API limits to 5000 requests/hour
   - Use batch operations for multiple changes
   - Implement delays between operations

### Debug Mode

Enable debug logging by setting environment variable:

```bash
DEBUG=content-manager:*
```

This will show detailed logs of all operations.

## Next Steps

1. **Test all CRUD operations** with your actual content
2. **Set up authentication** if you need access control
3. **Configure webhooks** for real-time updates (optional)
4. **Implement frontend integration** using the API endpoints
5. **Set up monitoring** and error tracking for production use

The system is now ready for production use with your GitHub repository as the content backend!