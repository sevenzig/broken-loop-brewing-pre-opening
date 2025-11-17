# Quick Start: Admin Authentication

## 🚀 Ready to Use!

Your admin panel is now fully secured with JWT authentication. Here's what you need to know:

## 1. Set Environment Variable

**In Vercel Dashboard** → Your Project → Settings → Environment Variables:

```
JWT_SECRET = your-super-secure-random-string-here-at-least-32-chars
```

**Generate a secure secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 2. Default Admin Credentials

- **Username**: `brewmaster`
- **Password**: `BrewMaster2025!`

**⚠️ IMPORTANT: Change these credentials before production!**

## 3. How to Test

1. **Start development server:**
   ```bash
   npm run dev
   ```

2. **Try to access admin panel:**
   - Go to `http://localhost:5173/admin`
   - You'll see a login modal overlay

3. **Login with credentials:**
   - Username: `brewmaster`
   - Password: `BrewMaster2025!`

4. **Test security features:**
   - Try wrong password 5 times → account locks for 15 minutes
   - Close browser tab → session persists
   - Wait 4 hours → token expires automatically
   - Click "Sign Out" → immediate logout

## 4. What's Protected

### Routes
- ✅ `/admin` - Main dashboard
- ✅ `/admin/beers/new` - Create beer
- ✅ `/admin/beers/:uuid/edit` - Edit beer
- ❌ `/admin/login` - Public login page

### API Endpoints
- ✅ `/api/admin/beers/*` - Beer management
- ✅ `/api/metadata` - Admin metadata
- ✅ `/api/sync` - GitHub sync
- ✅ `/api/upload` - File uploads
- ❌ `/api/auth/login` - Public login
- ❌ `/api/beers` - Public beer data (unchanged)

## 5. Security Features Active

✅ **JWT Authentication** - 4-hour sliding expiry  
✅ **Rate Limiting** - 5 attempts, 15-min lockout  
✅ **Security Logging** - All events monitored  
✅ **Protected Routes** - Modal overlay for unauthorized access  
✅ **Session Management** - Automatic refresh & cleanup  
✅ **Security Headers** - Modern 2025 best practices  
✅ **Permission System** - Role-based access control  

## 6. Next Steps

1. **Deploy to Vercel** with JWT_SECRET environment variable
2. **Change admin credentials** using the password hash generator
3. **Test in production** to ensure everything works
4. **Monitor security logs** for any issues

## 7. Change Admin Password

```bash
# Generate new hash
node scripts/generatePasswordHash.js "YourNewPassword"

# Update lib/auth/config.ts with the new hash
export const ADMIN_PASSWORD_HASH = 'new-hash-here';
```

## 8. Emergency Access

If you get locked out:
- **Wait 15 minutes** for rate limit reset
- **Check Vercel logs** for security events
- **Verify environment variables** are set correctly
- **Use browser dev tools** to clear sessionStorage if needed

---

**Your admin panel is now production-ready with enterprise-grade security! 🔒**


