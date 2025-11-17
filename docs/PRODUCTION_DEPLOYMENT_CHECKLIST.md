# Production Deployment Checklist

This checklist ensures your Broken Loop Brewing website is ready for production deployment to Vercel.

## Pre-Deployment Checklist

### ✅ Code Quality
- [ ] No mock data or hardcoded test values in API endpoints
- [ ] All TypeScript errors resolved
- [ ] ESLint passes without warnings
- [ ] All imports are used and properly typed
- [ ] Error handling implemented for all API endpoints
- [ ] Security headers applied to all responses

### ✅ Authentication & Security
- [ ] JWT_SECRET environment variable configured (minimum 32 characters)
- [ ] Rate limiting implemented for login endpoints
- [ ] Security headers configured (X-Frame-Options, X-Content-Type-Options, etc.)
- [ ] CORS properly configured for production domains
- [ ] Password hashing using bcrypt with proper salt rounds
- [ ] Token invalidation on logout implemented

### ✅ API Endpoints
- [ ] All API endpoints return proper JSON responses
- [ ] Error responses include appropriate HTTP status codes
- [ ] Business status endpoints read from actual data files
- [ ] File upload endpoints validate file types and sizes
- [ ] Admin endpoints require proper authentication and permissions
- [ ] Public endpoints don't require authentication

### ✅ Data Sources
- [ ] Business status reads from `public/data/business-status.json`
- [ ] Beer data reads from `public/data/beers.json`
- [ ] All data files exist and contain valid JSON
- [ ] No hardcoded data in API responses
- [ ] Fallback values provided for missing data

### ✅ Configuration
- [ ] Node.js version set to 23.0.0 in package.json
- [ ] Vercel configuration optimized for production
- [ ] Build scripts configured correctly
- [ ] Environment variables documented

## Environment Variables Setup

### Required Variables
```bash
# Set in Vercel Dashboard → Settings → Environment Variables
JWT_SECRET=your-super-secure-random-string-here-at-least-32-characters-long
```

### Optional Variables (for GitHub integration)
```bash
GITHUB_TOKEN=your-github-personal-access-token
GITHUB_OWNER=your-github-username
GITHUB_REPO=your-repository-name
GITHUB_BRANCH=main
CONTENT_PATH=src/data/beers
```

## Deployment Steps

### 1. Environment Variables
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `JWT_SECRET` with a secure random string (64+ characters recommended)
3. Add GitHub integration variables if using admin features
4. Set environment scope to "Production"

### 2. Deploy to Vercel
```bash
# Install Vercel CLI if not already installed
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### 3. Verify Deployment
After deployment, test the following:

#### Public Endpoints
- [ ] `GET /api/business-status` - Returns business status (public)
- [ ] `GET /api/beers` - Returns beer list with filtering
- [ ] `GET /api/beers/[uuid]` - Returns specific beer details
- [ ] `GET /api/metadata` - Returns system metadata

#### Authentication Endpoints
- [ ] `POST /api/auth/login` - Admin login works
- [ ] `POST /api/auth/logout` - Admin logout works
- [ ] `POST /api/auth/refresh` - Token refresh works

#### Admin Endpoints (require authentication)
- [ ] `GET /api/admin/beers` - Admin beer list
- [ ] `GET /api/admin/beers/[uuid]/edit` - Beer edit form
- [ ] `POST /api/business-status` - Business status update
- [ ] `POST /api/upload` - File upload

## Post-Deployment Testing

### 1. Frontend Functionality
- [ ] Homepage loads correctly
- [ ] Beer pages display properly
- [ ] Business status indicator works
- [ ] Admin login page accessible
- [ ] Admin panel functions correctly

### 2. API Functionality
- [ ] All public APIs return data
- [ ] Authentication flow works end-to-end
- [ ] Admin features require proper authentication
- [ ] Error handling works correctly
- [ ] CORS headers prevent unauthorized access

### 3. Security Testing
- [ ] Unauthorized access to admin endpoints returns 401
- [ ] Rate limiting prevents brute force attacks
- [ ] JWT tokens expire correctly
- [ ] Security headers are present in responses
- [ ] File uploads validate file types

## Monitoring & Maintenance

### 1. Logs
- [ ] Monitor Vercel function logs for errors
- [ ] Set up error tracking (Sentry, etc.) if needed
- [ ] Monitor authentication failures

### 2. Performance
- [ ] Check Core Web Vitals
- [ ] Monitor API response times
- [ ] Verify image optimization

### 3. Security
- [ ] Regularly rotate JWT_SECRET
- [ ] Monitor for suspicious login attempts
- [ ] Keep dependencies updated

## Troubleshooting

### Common Issues

1. **"JWT_SECRET environment variable is required"**
   - Ensure JWT_SECRET is set in Vercel environment variables
   - Verify it's set for the correct environment (Production)

2. **Business status shows hardcoded values**
   - Check that `public/data/business-status.json` exists
   - Verify the file contains valid JSON

3. **Authentication not working**
   - Verify JWT_SECRET is set correctly
   - Check that the secret is at least 32 characters long
   - Ensure CORS is configured for your domain

4. **File uploads failing**
   - Check file size limits (5MB max)
   - Verify file type validation
   - Ensure upload directory permissions

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Environment Variables Guide](docs/ENVIRONMENT_VARIABLES.md)
- [Authentication Setup](docs/AUTHENTICATION_SETUP.md)

## Success Criteria

Your deployment is successful when:
- ✅ All public pages load without errors
- ✅ Authentication system works correctly
- ✅ Admin panel is accessible and functional
- ✅ Business status updates work
- ✅ No console errors or failed API calls
- ✅ Security headers are present
- ✅ Performance metrics are acceptable

## Rollback Plan

If issues occur after deployment:
1. Check Vercel function logs for specific errors
2. Verify environment variables are set correctly
3. Test locally with production environment variables
4. If necessary, revert to previous deployment in Vercel dashboard
5. Fix issues and redeploy

---

**Note**: This checklist should be completed before every production deployment to ensure a smooth user experience and maintain security standards.
