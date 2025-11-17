# Broken Loop Brewing - Beer Management API

A complete Vercel serverless backend for managing brewery beer data using markdown files with GitHub integration.

## Features

- **CRUD Operations**: Create, read, update, and delete beer entries
- **Markdown-based**: All beer data stored as markdown files with frontmatter
- **GitHub Integration**: Automatic syncing with GitHub repository
- **File Upload**: Image upload support for beer photos
- **Validation**: Comprehensive validation for all beer data
- **Admin Interface**: Full admin API for beer management
- **Search & Filter**: Advanced search and filtering capabilities
- **UUID-based**: Unique identifiers for all beer entries

## API Endpoints

### Public API

#### GET /api/beers
List all beers with optional filtering and pagination.

**Query Parameters:**
- `status` - Filter by beer status (on-tap, seasonal, coming-soon, etc.)
- `style` - Filter by beer style
- `availability` - Filter by availability (Year-round, Spring, etc.)
- `search` - Search in name, style, and description
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 50, max: 100)
- `sortBy` - Sort field (name, status, created_at, updated_at)
- `sortOrder` - Sort direction (asc, desc)

**Response:**
```json
{
  "beers": [
    {
      "uuid": "hoppy-ipa-american-ipa",
      "name": "Hoppy IPA",
      "image": "/images/beers/hoppy-ipa.jpg",
      "slug": "hoppy-ipa",
      "abv": "6.8%",
      "ibu": "72",
      "srm": "8",
      "style": "American IPA",
      "status": "on-tap",
      "brief_description": "Bold and hoppy with citrus notes",
      "created_at": "2024-01-15T10:30:00Z",
      "updated_at": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50
}
```

#### POST /api/beers
Create a new beer entry.

**Request Body:**
```json
{
  "beer": {
    "name": "New Beer",
    "image": "/images/beers/new-beer.jpg",
    "slug": "new-beer",
    "abv": "5.5%",
    "ibu": "45",
    "srm": "6",
    "style": "American Pale Ale",
    "status": "coming-soon",
    "brief_description": "A refreshing pale ale"
  },
  "content": "# New Beer\n\nOptional markdown content..."
}
```

#### GET /api/beers/[uuid]
Get a specific beer by UUID.

**Response:**
```json
{
  "beer": {
    "uuid": "hoppy-ipa-american-ipa",
    "name": "Hoppy IPA",
    // ... all beer fields
  }
}
```

#### PUT /api/beers/[uuid]
Update a beer entry.

**Request Body:**
```json
{
  "beer": {
    "name": "Updated Beer Name",
    "status": "on-tap"
  },
  "content": "Updated markdown content..."
}
```

#### DELETE /api/beers/[uuid]
Delete a beer entry.

**Response:** 204 No Content

### Admin API

#### GET /api/admin/beers
Get admin beer list with additional metadata.

**Query Parameters:** Same as public API

**Response:**
```json
{
  "beers": [
    {
      "uuid": "hoppy-ipa-american-ipa",
      "name": "Hoppy IPA",
      // ... all beer fields
      "markdown": "---\nname: Hoppy IPA\n...",
      "filePath": "hoppy-ipa-american-ipa.md",
      "lastModified": "2024-01-15T10:30:00Z"
    }
  ],
  "total": 1,
  "page": 1,
  "limit": 50,
  "stats": {
    "total": 1,
    "onTap": 1,
    "seasonal": 0,
    "comingSoon": 0,
    "limitedEdition": 0,
    "soldOut": 0,
    "archived": 0,
    "retired": 0
  }
}
```

#### GET /api/admin/beers/[uuid]/edit
Get beer data for editing with dropdown options.

**Response:**
```json
{
  "beer": {
    "uuid": "hoppy-ipa-american-ipa",
    "name": "Hoppy IPA",
    // ... all beer fields
    "markdown": "---\nname: Hoppy IPA\n...",
    "filePath": "hoppy-ipa-american-ipa.md",
    "lastModified": "2024-01-15T10:30:00Z"
  },
  "dropdowns": {
    "statuses": [
      {"value": "on-tap", "label": "On Tap", "color": "#22c55e"},
      {"value": "seasonal", "label": "Seasonal", "color": "#f97316"}
    ],
    "availability": [
      {"value": "Year-round", "label": "Year-round"},
      {"value": "Spring", "label": "Spring"}
    ],
    "styles": [
      {"value": "American IPA", "label": "American IPA", "category": "IPA"},
      {"value": "American Pale Ale", "label": "American Pale Ale", "category": "Pale Ale"}
    ],
    "barrel_aged": [
      {"value": false, "label": "No"},
      {"value": true, "label": "Yes"}
    ]
  },
  "validation": {
    "isValid": true,
    "errors": []
  }
}
```

#### PUT /api/admin/beers/[uuid]/edit
Update beer data from admin interface.

**Request Body:**
```json
{
  "beer": {
    "name": "Updated Beer Name",
    "status": "on-tap"
  },
  "content": "Updated markdown content..."
}
```

### Utility API

#### GET /api/metadata
Get system metadata and dropdown options.

**Response:**
```json
{
  "dropdowns": {
    "statuses": [...],
    "availability": [...],
    "styles": [...],
    "barrel_aged": [...]
  },
  "stats": {
    "total": 1,
    "onTap": 1,
    // ... other stats
  },
  "systemInfo": {
    "version": "1.0.0",
    "environment": "development",
    "githubConnected": true,
    "contentPath": "src/data/beers",
    "uploadPath": "public/uploads",
    "lastSync": "2024-01-15T10:30:00Z"
  }
}
```

#### POST /api/upload
Upload an image file.

**Request:** Multipart form data with file field

**Response:**
```json
{
  "success": true,
  "filePath": "/uploads/beers/1705312200000-abc123.jpg",
  "message": "File uploaded successfully"
}
```

#### GET /api/sync
Get GitHub sync status.

**Response:**
```json
{
  "sync": {
    "status": "completed",
    "lastSync": "2024-01-15T10:30:00Z",
    "error": null
  },
  "github": {
    "connected": true,
    "repoInfo": {
      "name": "broken-loop-brewing",
      "description": "Brewery website",
      "url": "https://github.com/username/broken-loop-brewing"
    },
    "lastCommit": {
      "sha": "abc123...",
      "message": "Update beer: Hoppy IPA",
      "date": "2024-01-15T10:30:00Z"
    }
  }
}
```

#### POST /api/sync
Trigger GitHub sync.

**Response:**
```json
{
  "success": true,
  "message": "Sync completed successfully"
}
```

## Beer Data Schema

### Required Fields
- `name` - Beer name (string)
- `image` - Image path starting with /images/ (string)
- `slug` - URL-friendly identifier (string, lowercase, hyphens only)
- `abv` - Alcohol by volume (string, e.g., "6.8%")
- `ibu` - International Bitterness Units (string, 0-200)
- `srm` - Standard Reference Method color (string, 0-100)
- `style` - Beer style (must match predefined styles)
- `status` - Current status (on-tap, seasonal, coming-soon, etc.)
- `brief_description` - Short description (string)

### Optional Fields
- `availability` - Availability period (Year-round, Spring, etc.)
- `tapped_on` - Date tapped (YYYY-MM-DD format)
- `barrel_aged` - Whether barrel aged (boolean)
- `hops` - Hop varieties used (string)
- `malts` - Malt varieties used (string)
- `yeast` - Yeast strain used (string)
- `flavor_profile` - Detailed flavor description (string)
- `aroma` - Aroma description (string)
- `appearance` - Visual appearance description (string)

### System Fields (Auto-generated)
- `uuid` - Unique identifier (format: {beer-slug}-{style-slug})
- `created_at` - Creation timestamp (ISO string)
- `updated_at` - Last update timestamp (ISO string)

## Validation Rules

### Slug Validation
- Must contain only lowercase letters, numbers, and hyphens
- Must be unique across all beers
- Cannot be empty

### Image Validation
- Must start with /images/
- Must have valid extension (.jpg, .jpeg, .png, .svg, .webp)
- File must exist in public directory

### ABV Validation
- Must be a number with optional % symbol
- Must be between 0 and 100

### IBU Validation
- Must be a number between 0 and 200

### SRM Validation
- Must be a number between 0 and 100

### Date Validation
- `tapped_on` must be in YYYY-MM-DD format
- Must be a valid date

### Dropdown Validation
- `status` must match predefined status options
- `style` must match predefined style options
- `availability` must match predefined availability options
- `barrel_aged` must be true or false

## Error Responses

All API endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

### HTTP Status Codes
- `200` - Success
- `201` - Created
- `204` - No Content (for deletions)
- `400` - Bad Request (validation errors)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (duplicate entries)
- `413` - Payload Too Large (file uploads)
- `500` - Internal Server Error

## Environment Variables

Create a `.env` file with the following variables:

```env
# GitHub Integration (Optional)
GITHUB_TOKEN=your_github_token_here
GITHUB_OWNER=your_github_username
GITHUB_REPO=broken-loop-brewing
GITHUB_BRANCH=main
CONTENT_PATH=src/data/beers

# Upload Configuration
UPLOAD_PATH=public/uploads

# Frontend API Configuration
VITE_API_BASE_URL=/api

# Environment
NODE_ENV=development
```

## GitHub Integration

### Setup
1. Create a GitHub Personal Access Token with `repo` scope
2. Set environment variables for your repository
3. The system will automatically sync changes to GitHub

### Features
- Automatic file creation, updates, and deletions
- Commit messages with beer names
- Batch operations for multiple changes
- Error handling and retry logic
- Rate limiting protection

## File Structure

```
src/
├── data/
│   └── beers/
│       ├── hoppy-ipa-american-ipa.md
│       ├── golden-wheat-wheat-beer.md
│       └── ...
public/
├── images/
│   └── beers/
│       ├── hoppy-ipa.jpg
│       └── ...
└── uploads/
    └── beers/
        └── (uploaded files)
```

## Markdown File Format

Each beer is stored as a markdown file with YAML frontmatter:

```yaml
---
uuid: 'hoppy-ipa-american-ipa'
created_at: '2024-01-15T10:30:00Z'
updated_at: '2024-01-15T10:30:00Z'
name: 'Hoppy IPA'
image: '/images/beers/hoppy-ipa.jpg'
slug: 'hoppy-ipa'
abv: '6.8%'
ibu: '72'
srm: '8'
style: 'American IPA'
status: 'on-tap'
brief_description: 'Bold and hoppy with citrus notes'
availability: 'Year-round'
tapped_on: '2024-01-15'
barrel_aged: false
hops: 'Cascade, Centennial, Simcoe'
malts: '2-Row Pale Malt, Munich Malt'
yeast: 'Safale US-05 American Ale Yeast'
flavor_profile: 'Bold citrus and pine with balanced malt sweetness'
aroma: 'Bright citrus, floral hops, and subtle pine'
appearance: 'Golden amber with a persistent white head'
---

# Hoppy IPA - A Journey Through Flavor

Our flagship IPA is a bold expression of American hop character...

## Brewing Notes

Brewed with premium 2-Row Pale malt as the base...

## Food Pairings

- Spicy Thai curry dishes
- Sharp aged cheddar
- Grilled salmon with herbs
```

## Development

### Local Development
```bash
npm install
npm run dev
```

### API Testing
```bash
# List beers
curl http://localhost:3000/api/beers

# Create beer
curl -X POST http://localhost:3000/api/beers \
  -H "Content-Type: application/json" \
  -d '{"beer": {"name": "Test Beer", ...}}'

# Upload image
curl -X POST http://localhost:3000/api/upload \
  -F "file=@image.jpg"
```

### Deployment
The API routes are automatically deployed to Vercel when you push to your repository.

## Security Considerations

- All inputs are validated and sanitized
- File uploads are restricted to image types
- File size limits are enforced
- CORS headers are properly configured
- GitHub tokens are stored securely as environment variables

## Performance

- File-based storage for fast reads
- In-memory caching for frequently accessed data
- Efficient search and filtering
- Pagination for large datasets
- Optimized image handling

## Troubleshooting

### Common Issues

1. **GitHub Sync Fails**
   - Check GitHub token permissions
   - Verify repository access
   - Check network connectivity

2. **File Upload Fails**
   - Verify file type is supported
   - Check file size limits
   - Ensure upload directory exists

3. **Validation Errors**
   - Check all required fields are present
   - Verify dropdown values match predefined options
   - Ensure slug is unique

4. **API Errors**
   - Check environment variables
   - Verify file paths exist
   - Check server logs for details

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.
