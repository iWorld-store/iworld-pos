# Vercel Deployment Guide - Private POS

## Overview

Deploy your POS to Vercel via GitHub with **private access only** - no one can access it without authentication.

---

## Setup Steps

### 1. Create Private GitHub Repository

1. Go to GitHub.com
2. Click "New repository"
3. Name: `iworld-store-pos`
4. **Set to PRIVATE** ✅
5. Don't initialize with README
6. Click "Create repository"

### 2. Push Code to GitHub

```bash
cd "/Users/nabeel/Projects/iWorld Store"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - POS application"

# Add remote (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/iworld-store-pos.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### 3. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "Add New Project"
4. Import your `iworld-store-pos` repository
5. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (or leave default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist/react`
   - **Install Command**: `npm install`

### 4. Environment Variables (If Needed)

If you have any API keys or secrets:
- Go to Project Settings → Environment Variables
- Add any required variables

### 5. Make It Private (Password Protection)

**Option A: Vercel Password Protection**
1. Go to Project Settings → Deployment Protection
2. Enable "Password Protection"
3. Set a password
4. Only people with password can access

**Option B: Vercel Access Control**
1. Go to Project Settings → Access Control
2. Add specific email addresses
3. Only those people can access

**Option C: Deploy to Private Domain**
1. Use a custom domain
2. Don't share the URL publicly
3. Only give URL to authorized people

---

## Project Structure for Vercel

Your current setup works, but you need to:

1. **Build Script**: Make sure `package.json` has:
```json
"scripts": {
  "build": "npm run build:server && npm run build:react",
  "build:server": "tsc --project tsconfig.server.json",
  "build:react": "vite build"
}
```

2. **Vercel Configuration**: Create `vercel.json`:
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.ts",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist/react"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "server/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "dist/react/$1"
    }
  ]
}
```

---

## Important Notes

### Privacy Options:
1. **Private GitHub Repo** ✅ - Code is private
2. **Vercel Password Protection** ✅ - Site is password-protected
3. **Private Domain** ✅ - Use custom domain, don't share publicly
4. **Access Control** ✅ - Limit who can access

### Database:
- SQLite file won't work on Vercel (serverless)
- You'll need to switch to a cloud database (Supabase, PlanetScale, etc.)
- OR keep SQLite but use a different hosting (Railway, Render, etc.)

---

## Alternative: Railway/Render (Better for SQLite)

Since you have SQLite, **Vercel might not be ideal**. Consider:

### Railway (Recommended for SQLite):
1. Push to GitHub (private repo)
2. Connect Railway to GitHub
3. Deploy - Railway supports persistent storage
4. Add password protection
5. Private deployment

### Render:
1. Push to GitHub (private repo)
2. Connect Render to GitHub
3. Deploy as Web Service
4. Add authentication
5. Private deployment

---

## Quick Decision

**For SQLite + Privacy:**
- ✅ **Railway** - Best for SQLite, supports persistent storage
- ✅ **Render** - Good alternative, persistent storage
- ⚠️ **Vercel** - Serverless, SQLite won't work (need cloud DB)

**Recommendation**: Use **Railway** for SQLite support + privacy.

Would you like me to set up Railway deployment instead?

