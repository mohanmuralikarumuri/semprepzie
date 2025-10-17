# Cache Busting Guide - Force Users to Load New Bundle

## Problem
Users are seeing old JavaScript bundle (`index-92e0ad88.js`) even after deploying new code (`index-09a03a63.js`) because browsers cache the files.

## Solutions Implemented

### ✅ 1. Meta Tags (Added to index.html)
```html
<meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
<meta http-equiv="Pragma" content="no-cache" />
<meta http-equiv="Expires" content="0" />
```
**Effect**: Tells browsers NOT to cache the HTML file, forcing them to fetch fresh HTML (which references the new bundle).

### ✅ 2. Backend Server Headers (Already in server.ts)
```typescript
res.set('Cache-Control', 'public, max-age=86400');
```
**Effect**: Static assets (JS, CSS) cached for 1 day, but HTML is always fresh.

### ✅ 3. Vite Auto-Hashing (Already configured)
```typescript
// Vite automatically adds hash to filenames
index-92e0ad88.js → index-09a03a63.js
```
**Effect**: Each build gets unique filename, preventing cache conflicts.

## How to Force Users to See New Bundle

### For Development/Testing (Manual Methods):

1. **Hard Refresh (Recommended)**
   - Windows/Linux: `Ctrl + Shift + R` or `Ctrl + F5`
   - Mac: `Cmd + Shift + R`
   - **This clears cache for current page**

2. **Clear Browser Cache**
   - Chrome: `Ctrl + Shift + Delete` → Clear cached images and files
   - Edge: Same as Chrome
   - Firefox: `Ctrl + Shift + Delete` → Cached Web Content

3. **Incognito/Private Mode**
   - Chrome: `Ctrl + Shift + N`
   - Edge: `Ctrl + Shift + P`
   - **Fresh session, no cache**

### For Production (Automatic Methods):

#### ✅ Already Implemented:
1. **Meta tags force HTML reload** → Users get fresh HTML → HTML references new bundle
2. **Vite generates new hash** → `index-[hash].js` changes on each build
3. **Backend serves latest HTML** → No HTML caching

#### 🔄 After Deployment:
Users will automatically get the new bundle on their **next visit** (after HTML cache expires).

**First visit after deploy**: May see old bundle (cached HTML)
**Second visit (or hard refresh)**: Will see new bundle

## Deployment Checklist

### After Pushing Changes:

1. ✅ **Rebuild Frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. ✅ **Copy to Backend** (for Render deploy)
   ```bash
   xcopy frontend\dist backend\public /E /I /Y
   ```

3. ✅ **Commit Changes**
   ```bash
   git add frontend/index.html backend/src/server.ts
   git commit -m "Add cache-busting + fix API routes"
   ```

4. ✅ **Push to Trigger Deploy**
   ```bash
   git push origin main
   ```

5. ⏳ **Wait for Render** (~2-3 minutes)
   - Check Render dashboard for deployment status

6. 🧪 **Test**
   - **Option A**: Hard refresh on existing browser (`Ctrl + Shift + R`)
   - **Option B**: Open incognito window
   - **Option C**: Clear cache and reload

## Verification Steps

### 1. Check Bundle Version in Console:
```javascript
// Should see new bundle name
index-09a03a63.js  ✅ (NEW - has getApiUrl())
index-92e0ad88.js  ❌ (OLD - has localhost hardcoded)
```

### 2. Check API Calls in Network Tab:
```javascript
// OLD (Bad):
GET http://localhost:3001/api/lab/subjects → 503 ❌

// NEW (Good):
GET https://semprepzie.onrender.com/api/lab/subjects → 200 ✅
Response: {"success":true,"data":[...]} (JSON, not HTML)
```

### 3. Check Lab Section:
- ✅ Should see subjects loading
- ✅ Should see programs loading
- ✅ No "Failed to load subjects" error

## Current Status

### ✅ Completed:
1. Created `getApiUrl()` utility for environment detection
2. Updated 5 components to use `getApiUrl()`
3. Fixed backend route ordering (404 handler before catch-all)
4. Added cache-busting meta tags to HTML
5. Rebuilt frontend with new bundle
6. Ready to deploy

### 📦 Changes to Deploy:
- `frontend/index.html` - Cache-busting meta tags
- `backend/src/server.ts` - Fixed route ordering
- `frontend/src/config/api.ts` - New API URL utility
- `frontend/src/components/*.tsx` - 5 components updated

### 🎯 Expected Outcome After Deploy:
- ✅ Lab Section loads subjects from backend API
- ✅ MinCode Section loads subjects from backend API
- ✅ API returns JSON (not HTML)
- ✅ Both cached and fresh browsers work (after hard refresh on cached)

## Troubleshooting

### Still seeing old bundle?
1. Check console for bundle name
2. If `index-92e0ad88.js` → Hard refresh (`Ctrl + Shift + R`)
3. Still old? → Clear cache → Hard refresh
4. Still old? → Check Render deployment completed

### Still getting localhost errors?
1. Check bundle name (should be `index-09a03a63.js`)
2. Check `getApiUrl()` is imported in component
3. Check Render environment has backend deployed

### Still getting HTML instead of JSON?
1. Check backend deployment completed
2. Check route ordering in `server.ts` (404 before catch-all)
3. Check API endpoint exists: `GET /api/lab/subjects`

## Why This Works

### Problem Flow (Before):
```
Browser → Load HTML (cached) 
       → HTML references index-92e0ad88.js (old bundle)
       → Old bundle calls http://localhost:3001
       → 503 Error
```

### Solution Flow (After):
```
Browser → Load HTML (no-cache meta) 
       → Fetch fresh HTML from server
       → HTML references index-09a03a63.js (new bundle)
       → New bundle calls https://semprepzie.onrender.com
       → 200 OK with JSON
```

## Additional Cache-Busting Options (Future)

### 1. Service Worker Update Strategy
```javascript
// In sw.js - force update on version change
const CACHE_VERSION = 'v2'; // Increment on deploy
```

### 2. Version Query Parameter
```html
<script src="/assets/index.js?v=2.0.1"></script>
```

### 3. Manifest Version
```json
// package.json version auto-injected
{ "version": "2.0.1" }
```

## Notes

- **Vite already handles hashing** - No need for manual version parameters
- **Meta tags are best for HTML** - Forces browser to check server
- **Incognito mode** - Best for testing without affecting cache
- **Hard refresh** - Best for users to see immediate updates
- **Service Worker** - Consider for future PWA caching strategy

---

**Last Updated**: After fixing API route ordering and adding cache-busting meta tags
**Next Step**: Deploy to Render and test with hard refresh
