# Environment Variables for Production Deployment

This document outlines all required and optional environment variables for deploying the Broken Loop Brewing website to Vercel.

## Required Environment Variables

### JWT_SECRET
- **Description**: Secret key for signing and verifying JWT tokens
- **Type**: String
- **Length**: Minimum 32 characters (recommended: 64+ characters)
- **Example**: `your-super-secure-random-string-here-at-least-32-characters-long`
- **Security**: Generate a cryptographically secure random string
- **Usage**: Used by authentication system for token signing and verification

## Optional Environment Variables

### GitHub Integration (for Admin Panel)
These variables enable GitHub integration for content management:

- **GITHUB_TOKEN**: Personal access token with repo permissions
- **GITHUB_OWNER**: GitHub username or organization name
- **GITHUB_REPO**: Repository name
- **GITHUB_BRANCH**: Branch name (default: 'main')
- **CONTENT_PATH**: Path to content files in repository (default: 'src/data/beers')

## Setting Environment Variables in Vercel

### Via Vercel Dashboard
1. Go to your project in the Vercel dashboard
2. Navigate to Settings → Environment Variables
3. Add each variable with the appropriate value
4. Set the environment scope (Production, Preview, Development)

### Via Vercel CLI
```bash
# Set JWT_SECRET for production
vercel env add JWT_SECRET production

# Set GitHub integration variables
vercel env add GITHUB_TOKEN production
vercel env add GITHUB_OWNER production
vercel env add GITHUB_REPO production
vercel env add GITHUB_BRANCH production
vercel env add CONTENT_PATH production
```

## Security Best Practices

1. **JWT_SECRET**: Use a cryptographically secure random string
   ```bash
   # Generate a secure JWT secret (64 characters)
   openssl rand -base64 48
   ```

2. **GitHub Token**: Use a personal access token with minimal required permissions:
   - `repo` (for private repositories)
   - `public_repo` (for public repositories)

3. **Environment Scope**: Set sensitive variables only for production environment

## Validation

The application will validate environment variables on startup:

- **JWT_SECRET**: Must be present and at least 32 characters long
- **GitHub variables**: Optional, but if any are provided, all should be provided

## Troubleshooting

### Common Issues

1. **"JWT_SECRET environment variable is required"**
   - Ensure JWT_SECRET is set in Vercel environment variables
   - Verify the variable is set for the correct environment (Production)

2. **"JWT_SECRET must be at least 32 characters long"**
   - Generate a longer secret key
   - Use the OpenSSL command above to generate a secure key

3. **GitHub integration not working**
   - Verify all GitHub environment variables are set
   - Check that the GitHub token has the correct permissions
   - Ensure the repository exists and is accessible

### Testing Environment Variables

You can test your environment variables locally:

```bash
# Set environment variables for local testing
export JWT_SECRET="your-test-secret-here"
export GITHUB_TOKEN="your-github-token"
export GITHUB_OWNER="your-username"
export GITHUB_REPO="your-repo"
export GITHUB_BRANCH="main"
export CONTENT_PATH="src/data/beers"

# Run the development server
npm run dev
```

## Production Checklist

Before deploying to production, ensure:

- [ ] JWT_SECRET is set and is at least 32 characters long
- [ ] JWT_SECRET is cryptographically secure (not a simple string)
- [ ] All required environment variables are set in Vercel
- [ ] Environment variables are set for the correct environment scope
- [ ] GitHub integration variables are set if using admin panel features
- [ ] Test authentication endpoints work correctly
- [ ] Business status endpoints return real data (not hardcoded values)

## Support

If you encounter issues with environment variables:

1. Check the Vercel function logs for error messages
2. Verify environment variables are set correctly in the Vercel dashboard
3. Test locally with the same environment variables
4. Review the authentication setup documentation
