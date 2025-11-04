# Railway Quick Start Guide

## ✅ Code is Ready!

Your code is already on GitHub and ready for Railway deployment.

---

## Step-by-Step Deployment

### Step 1: Create Railway Account

1. Go to **https://railway.app**
2. Click **"Start a New Project"** or **"Login"**
3. Sign up with **GitHub** (use your client's account: **iWorld-store**)
4. Authorize Railway to access your GitHub repositories

---

### Step 2: Deploy from GitHub

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. You'll see your repositories
4. Click **"Deploy"** next to **`iworld`** repository

**That's it!** Railway will:
- Auto-detect Node.js
- Install dependencies
- Build your app
- Deploy it

---

### Step 3: Wait for Deployment

Railway will:
1. Clone your repo
2. Run `npm install`
3. Run build (if configured)
4. Start your app
5. Give you a URL: `yourapp.railway.app`

**Wait 2-3 minutes** for the build to complete.

---

### Step 4: Configure (If Needed)

Railway usually auto-detects everything, but if needed:

**Settings → Build & Deploy:**
- **Build Command**: `npm run build:railway` (or leave empty if auto-detected)
- **Start Command**: `npm start` (or `node dist/server/index.js`)

**Settings → Variables:**
- Railway automatically sets `PORT` - no need to add it!

---

### Step 5: Get Your URL

1. Once deployed, Railway shows your app URL
2. Click the URL to open your POS
3. **It should work!** ✅

---

### Step 6: Make It Private

**Option A: Keep URL Private**
- Railway gives you a random URL
- Don't share publicly
- Only give to authorized people

**Option B: Add Password (Later)**
- Can add password protection middleware
- Or use Railway's auth features

---

## What Works on Railway

✅ **SQLite** - Works perfectly with persistent storage  
✅ **All features** - Add, Sell, Return, Reports  
✅ **Data persists** - No data loss on redeploy  
✅ **Auto-deploy** - Push to GitHub → Auto-deploys  
✅ **Free tier** - $5 credit/month (usually enough)  

---

## Testing

After deployment:
1. Open your Railway URL
2. Dashboard should load
3. Try adding a phone - should work
4. Data persists between page refreshes ✅

---

## Updates

To update your app:
1. Make changes to code
2. Push to GitHub: `git push`
3. Railway auto-deploys
4. Done!

---

## Troubleshooting

### If build fails:
- Check Railway logs
- Verify all dependencies in `package.json`

### If app doesn't start:
- Check Railway logs
- Verify `npm start` command works

### If database errors:
- Check Railway logs for database initialization
- Should work automatically with SQLite

---

## Quick Reference

**Railway Dashboard**: https://railway.app/dashboard  
**Your GitHub Repo**: https://github.com/iWorld-store/iworld  
**Deploy URL**: Will be shown after deployment  

---

**Ready?** Go to railway.app and deploy! 🚀

