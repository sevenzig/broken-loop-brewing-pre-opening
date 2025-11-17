# Vercel Deployment Solution: Simple Content Serving

## Problem
The admin panel couldn't find beers in production because Vercel's serverless functions can't access the local filesystem to read markdown files from `src/data/`.

## Solution: Move Data to Public Folder
Instead of complex build scripts or database solutions, we moved all content data to the `public/` folder where Vercel can serve it as static files.

## What We Did

### 1. Moved Data to Public
```bash
public/data/
├── beers.json      # All beer data
├── events.json     # All event data  
├── food.json       # All food data
└── templates/      # Content templates
```

### 2. Updated BeerService
- Removed filesystem operations (`fs.readdir`, `fs.readFile`)
- Added simple `fetch()` calls to `/data/beers.json`
- Works identically in development and production

### 3. Created Build Script
```bash
npm run build:content  # Generates JSON from markdown
npm run build:full     # Builds content + app
```

## Why This Solution is Best

✅ **Simplest possible approach** - No complex abstractions
✅ **Works identically everywhere** - Dev, staging, production
✅ **Leverages Vercel's strengths** - Static file serving
✅ **No dual code paths** - Same service works everywhere
✅ **Easy to maintain** - Single source of truth
✅ **Fast performance** - Static JSON files served by CDN

## How It Works

1. **Development**: Service fetches from `/data/beers.json`
2. **Production**: Vercel serves the same JSON files
3. **No filesystem access needed** - Pure HTTP requests
4. **Content updates**: Run `npm run build:content` and redeploy

## Deployment Workflow

```bash
# 1. Update markdown files in src/data/
# 2. Generate JSON data
npm run build:content

# 3. Build and deploy
npm run build:full
vercel --prod
```

## Trade-offs

- **Content is public** - Anyone can access `/data/beers.json`
- **Read-only in production** - Admin panel can't create/edit beers
- **Manual content updates** - Need to rebuild and redeploy

## For Future Admin Features

If you need admin panel editing in production, consider:
1. **Database solution** (Supabase, MongoDB)
2. **CMS integration** (Strapi, Contentful)
3. **Git-based workflow** (edit markdown → commit → auto-deploy)

But for now, this simple solution gets your site working immediately with minimal complexity.
