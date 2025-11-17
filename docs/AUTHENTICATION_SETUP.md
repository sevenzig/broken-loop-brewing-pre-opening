# Authentication Setup Guide

## Overview

This guide explains how to set up and configure the JWT-based authentication system for the Broken Loop Brewing admin panel.

## Security Features

✅ **JWT-based authentication** with 4-hour sliding expiry  
✅ **Rate limiting** with 5-attempt lockout and 15-minute cooldown  
✅ **Hardcoded admin credentials** (more secure than environment variables)  
✅ **Session storage** for token persistence  
✅ **Security event logging** for monitoring  
✅ **Protected API routes** with permission-based access control  
✅ **Modern security headers** and CORS protection  
✅ **Automatic token refresh** and session management  

## Environment Variables

Add these to your Vercel environment variables:

```env
# JWT Secret (REQUIRED - generate a random 32+ character string)
JWT_SECRET=your-super-secure-random-string-here-at-least-32-chars

# Optional: Override default lockout settings
AUTH_LOCKOUT_DURATION=900000  # 15 minutes in milliseconds
AUTH_MAX_ATTEMPTS=5           # Maximum login attempts
```

### Generating JWT Secret

```bash
# Generate a secure random string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Admin Credentials

The admin credentials are hardcoded in `lib/auth/config.ts` for security:

- **Username**: `brewmaster`
- **Password**: `BrewMaster2025!` (default - CHANGE THIS)

### Changing Admin Password

1. **Generate new password hash:**
   ```bash
   node scripts/generatePasswordHash.js "YourNewPassword"
   ```

2. **Update the hash in `lib/auth/config.ts`:**
   ```typescript
   export const ADMIN_PASSWORD_HASH = 'your-new-bcrypt-hash-here';
   ```

3. **Update the username if desired:**
   ```typescript
   export const ADMIN_USER = {
     id: 'admin-001',
     username: 'your-new-username', // Change this
     role: 'admin',
     permissions: [/* ... */]
   };
   ```

## Protected Routes

All admin routes are now protected:

- `/admin` - Main admin dashboard
- `/admin/login` - Login page (public)
- `/admin/beers/new` - Create new beer
- `/admin/beers/:uuid/edit` - Edit existing beer

## Protected API Endpoints

All admin API endpoints now require authentication:

- `/api/admin/beers/*` - Beer management APIs
- `/api/metadata` - Admin metadata
- `/api/sync` - GitHub synchronization
- `/api/upload` - File upload
- `/api/auth/login` - Login (public)
- `/api/auth/logout` - Logout
- `/api/auth/refresh` - Token refresh

## Authentication Flow

### 1. Login Process
```typescript
// User submits credentials
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username, password })
});

// Success response includes JWT token
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "admin-001",
    "username": "brewmaster",
    "role": "admin",
    "permissions": ["admin:access", "beer:create", ...]
  }
}
```

### 2. Authenticated Requests
```typescript
// Include JWT token in Authorization header
const response = await fetch('/api/admin/beers', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

### 3. Token Refresh (Sliding Expiry)
```typescript
// Automatic refresh every 30 minutes
const response = await fetch('/api/auth/refresh', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${currentToken}` }
});
```

### 4. Logout
```typescript
// Invalidate token and clear session
await fetch('/api/auth/logout', {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
});
```

## Security Features

### Rate Limiting
- **5 failed attempts** trigger 15-minute account lockout
- **IP-based tracking** prevents brute force attacks
- **Automatic cleanup** of expired rate limit entries

### Security Headers
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security` (production only)

### Security Event Logging
All authentication events are logged:
- Login success/failure
- Account lockouts
- Unauthorized access attempts
- Token refresh events
- Logout events

### Token Security
- **4-hour expiry** with sliding renewal
- **Secure signing** with HS256 algorithm
- **Session ID tracking** for invalidation
- **Automatic cleanup** of expired tokens

## Permission System

### Available Permissions
- `admin:access` - Access admin panel
- `beer:create` - Create new beers
- `beer:read` - View beer data
- `beer:update` - Update existing beers
- `beer:delete` - Delete beers
- `business:manage` - Control business status
- `sync:github` - GitHub synchronization
- `upload:files` - File upload access

### Route Protection Examples
```typescript
// Require admin access only
<ProtectedRoute requiredPermissions={['admin:access']}>
  <AdminDashboard />
</ProtectedRoute>

// Require specific beer permissions
<ProtectedRoute requiredPermissions={['admin:access', 'beer:create']}>
  <CreateBeerPage />
</ProtectedRoute>
```

## Development Testing

The authentication system is **always active** in development for consistent testing:

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Navigate to `/admin`** - you'll see the login modal

3. **Login with default credentials:**
   - Username: `brewmaster`
   - Password: `BrewMaster2025!`

4. **Test protected routes** and API endpoints

## Production Deployment

### Vercel Environment Variables

Set these in your Vercel project settings:

```env
JWT_SECRET=your-64-character-random-string-here
NODE_ENV=production
```

### Security Checklist

- [ ] JWT_SECRET is set in Vercel environment variables
- [ ] JWT_SECRET is at least 32 characters long
- [ ] Admin password has been changed from default
- [ ] CORS origins are restricted to your domain
- [ ] Security headers are enabled
- [ ] Rate limiting is configured
- [ ] Security event logging is working

## Monitoring and Maintenance

### Security Monitoring
Monitor these events in production:
- Failed login attempts
- Account lockouts
- Unauthorized access attempts
- Token refresh patterns

### Regular Maintenance
- **Rotate JWT secret** quarterly
- **Update admin password** regularly
- **Review security logs** monthly
- **Update dependencies** for security patches

## Troubleshooting

### Common Issues

**"JWT_SECRET environment variable is required"**
- Set JWT_SECRET in Vercel environment variables
- Ensure it's at least 32 characters long

**"Invalid credentials" with correct password**
- Check if account is locked (wait 15 minutes)
- Verify password hash in config.ts
- Check rate limiting logs

**"Token expired" errors**
- Check system clock synchronization
- Verify token expiry settings
- Check automatic refresh functionality

**API returns 401 Unauthorized**
- Verify token is included in Authorization header
- Check token validity and expiry
- Ensure API route has authentication middleware

### Testing Authentication

```bash
# Test login endpoint
curl -X POST http://localhost:5173/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"brewmaster","password":"BrewMaster2025!"}'

# Test protected endpoint
curl -X GET http://localhost:5173/api/admin/beers \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Test logout
curl -X POST http://localhost:5173/api/auth/logout \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Architecture Overview

```
Frontend (React)
├── AuthProvider (Context)
├── ToastProvider (Notifications)
├── ProtectedRoute (Route wrapper)
└── AdminLoginPage (Login form)

Backend (Vercel Serverless)
├── /api/auth/login (Authentication)
├── /api/auth/logout (Session invalidation)
├── /api/auth/refresh (Token refresh)
└── requireAuth() middleware (API protection)

Security Layer
├── JWT signing/verification
├── Rate limiting
├── Password hashing (bcrypt)
├── Security event logging
└── Permission validation
```

This authentication system provides enterprise-grade security for your brewery admin panel while maintaining simplicity and ease of use.


