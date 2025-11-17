# GitHub-Based CRUD System Documentation

## Overview

This system provides a comprehensive, robust CRUD (Create, Read, Update, Delete) interface for managing markdown-based content using GitHub's infrastructure as the backend. It's designed specifically for the Broken Loop Brewing website to manage beers, food items, and events.

## Architecture

### Core Components

1. **ContentManagerService** - Main orchestrator for all CRUD operations
2. **GitHubService** - Direct interface with GitHub API for file operations  
3. **ValidationService** - Schema validation and content verification
4. **ConflictResolutionService** - Handles merge conflicts and concurrent edits
5. **Content Routes** - RESTful API endpoints for frontend integration

### Data Flow

```
Frontend Request → API Routes → ContentManagerService → GitHubService → GitHub Repository
                                       ↓
                        ValidationService ← ConflictResolutionService
```

## Features

### ✅ Complete CRUD Operations
- **Create**: Add new content with validation and conflict detection
- **Read**: Retrieve individual items or paginated lists with search/filtering
- **Update**: Modify existing content with conflict resolution
- **Delete**: Remove content with safety checks

### ✅ Content Types Supported
- **Beers**: Full beer catalog management with ABV, IBU, styles, etc.
- **Food**: Menu items with categories, prices, allergens, etc.
- **Events**: Brewery events with dates, times, registration, etc.

### ✅ Advanced Features
- **Batch Operations**: Execute multiple operations in a single transaction
- **Content Validation**: Comprehensive schema validation with custom rules
- **Conflict Resolution**: Smart merging of concurrent edits
- **Search & Filtering**: Full-text search with advanced filtering options
- **Version Control**: Leverages Git history for content versioning
- **Content Statistics**: Analytics and reporting on content usage

## API Endpoints

### Content Management

```http
GET    /api/content/:type              # List content items
GET    /api/content/:type/:id          # Get single item
POST   /api/content/:type              # Create new item
PUT    /api/content/:type/:id          # Update existing item
DELETE /api/content/:type/:id          # Delete item
```

### Batch Operations

```http
POST   /api/content/batch              # Execute batch operations
```

### Validation & Conflict Resolution

```http
POST   /api/content/:type/:id/validate # Validate content
GET    /api/content/:type/:id/conflicts/:other # Check conflicts
POST   /api/content/:type/:id/resolve-conflicts # Resolve conflicts
```

### Search & Analytics

```http
GET    /api/content/search             # Global content search
GET    /api/content/stats              # Content statistics
```

## Usage Examples

### Creating a New Beer

```javascript
const newBeer = {
  metadata: {
    name: "Hoppy Trail IPA",
    slug: "hoppy-trail-ipa",
    abv: "6.2%",
    ibu: "55",
    style: "American IPA",
    status: "on-tap",
    availability: "year-round",
    brief_description: "A crisp, hoppy IPA with citrus notes"
  },
  content: `# Hoppy Trail IPA

Our flagship IPA combines cascade and centennial hops for a perfect balance of bitter and citrus flavors.

## Tasting Notes
- **Aroma**: Citrus, pine, floral
- **Flavor**: Grapefruit, orange peel, subtle malt sweetness
- **Finish**: Clean, dry, lingering hop bitterness`
};

// POST /api/content/beer
const response = await fetch('/api/content/beer', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(newBeer)
});
```

### Batch Operations

```javascript
const batchOp = {
  operations: [
    {
      action: 'create',
      type: 'beer',
      data: { /* beer data */ }
    },
    {
      action: 'update', 
      type: 'food',
      id: 'loaded-nachos',
      data: { metadata: { price: '$12.99' } }
    },
    {
      action: 'delete',
      type: 'event',
      id: 'old-event-id'
    }
  ],
  stopOnFirstError: false
};

// POST /api/content/batch
const response = await fetch('/api/content/batch', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(batchOp)
});
```

### Search and Filtering

```javascript
// Search across all content types
const searchResults = await fetch('/api/content/search?q=IPA&types=beer,food');

// Filter beers by status and style
const beerList = await fetch('/api/content/beer?status=on-tap&style=IPA&sortBy=name');

// Get paginated results
const page2 = await fetch('/api/content/food?page=2&limit=20&category=mains');
```

## Configuration

### Environment Variables

```bash
# GitHub Integration
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_OWNER=your-username
GITHUB_REPO=your-repo-name
GITHUB_BRANCH=main
GITHUB_CONTENT_PATH=src/data

# Optional: Authentication
JWT_SECRET=your-jwt-secret
```

### Content Structure

The system expects content to be organized as:

```
src/data/
├── beers/
│   ├── hoppy-trail-ipa.md
│   ├── midnight-stout.md
│   └── ...
├── food/
│   ├── appetizers/
│   ├── mains/
│   └── ...
└── events/
    ├── trivia-thursdays.md
    └── ...
```

Each markdown file contains:

```markdown
---
name: "Hoppy Trail IPA"
slug: "hoppy-trail-ipa"
abv: "6.2%"
ibu: "55"
status: "on-tap"
# ... other metadata
---

# Content body in markdown

Description and details about the item...
```

## Validation Rules

### Beer Content
- **Required**: name, slug, status
- **ABV**: Must be valid percentage (0-20%)
- **IBU**: Must be valid number (0-120)
- **Status**: Must be one of: on-tap, coming-soon, seasonal, archived
- **Style**: Should be recognized beer style

### Food Content  
- **Required**: name, category, status
- **Category**: Must be: appetizers, mains, sides, desserts, specials
- **Price**: Must be valid currency format
- **Status**: Must be: available, unavailable, seasonal, archived

### Event Content
- **Required**: name, date, status  
- **Date**: Must be valid ISO date
- **Times**: Must be HH:MM format
- **Status**: Must be: upcoming, ongoing, completed, cancelled

## Conflict Resolution

The system automatically handles conflicts when multiple users edit the same content:

### Resolution Strategies

1. **Overwrite** - Replace existing content entirely
2. **Merge** - Intelligently combine changes
3. **Reject** - Reject conflicting changes
4. **Version** - Create new version of content
5. **Interactive** - Present conflicts to user for manual resolution

### Auto-Resolution

- Low-severity conflicts (timestamps, minor metadata) are auto-resolved
- Medium-severity conflicts can be auto-merged with smart algorithms
- High-severity conflicts (core fields) require manual intervention

## Error Handling

The system provides comprehensive error handling:

- **Validation Errors**: Detailed field-level validation messages
- **GitHub Errors**: Network issues, rate limiting, authentication failures
- **Conflict Errors**: Merge conflicts with resolution suggestions
- **Permission Errors**: Authorization and access control

## Performance Considerations

### Rate Limiting
- GitHub API has rate limits (5000 requests/hour for authenticated users)
- System includes automatic delays between batch operations
- Implements exponential backoff for rate limit errors

### Caching
- Content is cached locally during operations
- Validation schemas are cached to improve performance
- GitHub API responses are cached when appropriate

### Optimization
- Batch operations are executed sequentially to avoid conflicts
- Large payloads are compressed when possible
- Minimal API calls through smart diffing

## Security

### Authentication
- JWT-based authentication for write operations
- Read operations can be public or authenticated based on configuration
- GitHub token is securely stored and never exposed to frontend

### Authorization
- Role-based access control (can be extended)
- Content-type specific permissions
- Audit trail through Git commit history

### Data Validation
- All content is validated before GitHub commits
- XSS protection through markdown sanitization
- Input sanitization and SQL injection prevention

## Monitoring & Logging

### Comprehensive Logging
- All CRUD operations are logged with timestamps
- Error tracking with stack traces
- Performance monitoring for slow operations

### GitHub Integration
- All changes create Git commits with descriptive messages
- Full audit trail through GitHub commit history
- Branch protection and pull request workflows supported

## Future Enhancements

### Planned Features
- **Real-time Collaboration**: WebSocket-based live editing
- **Content Templates**: Predefined templates for common content types
- **Workflow Management**: Approval workflows for content changes
- **Analytics Integration**: Content performance tracking
- **Backup & Recovery**: Automated content backups
- **Multi-language Support**: Internationalization features

### Extensibility
- Plugin system for custom content types
- Custom validation rules
- Webhook integration for external systems
- Custom conflict resolution strategies

## Support & Troubleshooting

### Common Issues

1. **GitHub Authentication Errors**
   - Verify GITHUB_TOKEN is valid and has repo permissions
   - Check if repository exists and is accessible

2. **Validation Failures**
   - Review validation error messages
   - Check content against schema requirements
   - Verify required fields are present

3. **Merge Conflicts**
   - Use conflict resolution endpoints to analyze issues
   - Consider manual resolution for complex conflicts
   - Implement proper locking for critical operations

### Getting Help

- Check the API response messages for detailed error information
- Review GitHub commit history for operation audit trail  
- Monitor server logs for system-level issues
- Use validation endpoints to debug content issues

## Conclusion

This GitHub-based CRUD system provides a robust, scalable solution for managing markdown-based content with full version control, validation, and conflict resolution. It leverages GitHub's reliable infrastructure while providing a modern API interface suitable for any frontend framework.