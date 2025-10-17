# Render Deployment Guide for Semprepzie

## 🚨 Critical: Memory Optimization for 512MB Instance

This project has been optimized to deploy on Render's free tier (512MB RAM limit).

### Pre-Deployment Checklist

1. **Build Frontend Locally** (REQUIRED)
   ```bash
   cd frontend
   npm run build:local
   ```
   
2. **Commit the frontend/dist folder** (REQUIRED)
   ```bash
   git add frontend/dist -f
   git commit -m "Add pre-built frontend for Render deployment"
   git push
   ```

3. **Update Render Settings**
   - Build Command: `npm run start:render`
   - Start Command: `cd backend && npm start`
   - Environment: Node 18+

### Why Pre-Build Frontend?

Render's free tier has 512MB RAM, but Vite build requires ~600-800MB. By pre-building and committing the frontend dist folder, we:
- ✅ Skip memory-intensive frontend build on Render
- ✅ Deploy in under 3 minutes
- ✅ Stay within 512MB limit
- ✅ Only build lightweight backend + shared packages

### Render Configuration

**Build Command:**
```bash
npm run start:render
```

This runs the optimized `render-build.sh` script which:
1. Builds shared package (low memory)
2. Builds backend (low memory)
3. Uses pre-built frontend from committed dist folder
4. Copies frontend to backend/public

**Start Command:**
```bash
cd backend && npm start
```

### Environment Variables on Render

Set these in Render Dashboard:
```env
NODE_ENV=production
PORT=10000
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key
FIREBASE_PROJECT_ID=your_project_id
# ... other env vars
```

### Local Development vs Render

| Environment | Frontend Build | Memory | Time |
|-------------|---------------|--------|------|
| **Local Dev** | `npm run build:local` | 1024MB | 15-20s |
| **Render** | Uses committed dist | 384MB | 2-3min |

### Troubleshooting

**Error: Out of memory (used over 512Mi)**
- ✅ **Solution**: Make sure frontend/dist is committed
- Check: `git ls-files frontend/dist` should show files
- Rebuild: `cd frontend && npm run build:local`
- Commit: `git add frontend/dist -f && git commit -m "Update frontend build"`

**Error: Frontend not loading**
- Verify dist folder exists: `ls frontend/dist`
- Check copy command worked: `ls backend/public`
- Ensure render-build.sh has execute permissions

### Manual Build Process

If you need to rebuild everything locally:

```bash
# Build frontend with high memory (local only)
cd frontend
npm run build:local

# Commit the build
git add dist -f
git commit -m "Update frontend build for Render"
git push

# Render will automatically deploy
```

### Optimization Details

1. **Vite Config** (`frontend/vite.config.ts`)
   - `maxParallelFileOps: 1` - Sequential processing
   - `reportCompressedSize: false` - Skip gzip analysis
   - `sourcemap: false` - No source maps in production
   - `minify: 'esbuild'` - Fast minification

2. **Build Scripts** (`frontend/package.json`)
   - `build:prod`: 384MB for Render (minimal)
   - `build:local`: 1024MB for development

3. **Memory Allocation** (`render-build.sh`)
   - Shared: 384MB
   - Backend: 384MB
   - Frontend: Skipped (uses pre-built)

### Updating Frontend

When you make frontend changes:

```bash
# 1. Make your changes
# 2. Build locally
cd frontend && npm run build:local

# 3. Commit the new build
git add dist -f
git commit -m "Update: [describe changes]"
git push

# 4. Render auto-deploys
```

### Why This Approach?

| Traditional Deploy | Our Optimized Deploy |
|-------------------|---------------------|
| Build everything on Render | Pre-build frontend locally |
| 800MB+ memory needed | 384MB memory needed |
| 10-15 min deploy time | 2-3 min deploy time |
| ❌ Out of memory errors | ✅ Successful deploys |
| Free tier fails | Free tier works |

### Success Checklist

- [ ] Frontend built locally (`npm run build:local`)
- [ ] frontend/dist folder committed to git
- [ ] Render build command: `npm run start:render`
- [ ] Render start command: `cd backend && npm start`
- [ ] All environment variables set
- [ ] Deploy succeeds in < 5 minutes

### Support

If deployment still fails:
1. Check Render logs for specific error
2. Verify frontend/dist is in git: `git ls-files frontend/dist`
3. Try manual build: `bash render-build.sh` locally
4. Check memory usage in Render dashboard

---

**Last Updated**: October 17, 2025
**Tested On**: Render Free Tier (512MB RAM)
