# Railway Deployment Setup - Step by Step

## Why Railway?

✅ **SQLite works perfectly** - Persistent storage  
✅ **Private deployments** - Same as Vercel  
✅ **GitHub integration** - Easy deployment  
✅ **Free tier available** - $5 credit/month  
✅ **No code changes needed** - Your code works as-is  

---

## Step 1: Create Railway Account

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Sign up with GitHub (use your client's GitHub account: **iWorld-store**)
4. Authorize Railway to access GitHub

---

## Step 2: Deploy from GitHub

1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your repository: **`iWorld-store/iworld`**
4. Railway will automatically detect it's a Node.js project

---

## Step 3: Configure Build

Railway auto-detects most settings, but verify:

**Build Settings:**
- **Build Command**: `npm run build:server && npm run build:react`
- **Start Command**: `npm start` (or `node dist/server/index.js`)
- **Root Directory**: `./` (leave default)

**Note**: Railway might auto-detect these correctly.

---

## Step 4: Environment Variables

Railway automatically sets:
- ✅ `PORT` - Railway sets this automatically

**No additional variables needed!**

---

## Step 5: Deploy

1. Railway will automatically start building
2. Wait 2-3 minutes for deployment
3. Railway will give you a URL: `yourapp.railway.app`

---

## Step 6: Make It Private

### Option A: Keep URL Private
- Railway gives you a random URL
- Don't share publicly
- Only give to authorized people

### Option B: Add Password Protection
- Add middleware to require password
- Or use Railway's built-in auth (if available)

### Option C: Custom Domain + Password
- Add custom domain in Railway
- Add password protection
- Maximum privacy

---

## Step 7: Verify It Works

1. Open your Railway URL
2. Check Dashboard - should load without errors
3. Test adding a phone - should work
4. Data persists! ✅

---

## Important Notes

### Database:
- ✅ SQLite file stored in Railway's persistent volume
- ✅ Data persists between deployments
- ✅ No data loss!

### Updates:
- Push to GitHub → Railway auto-deploys
- Same as Vercel workflow

### Cost:
- **Free tier**: $5 credit/month (usually enough for small apps)
- **Hobby plan**: $5/month if needed

---

## Quick Start Commands

```bash
# 1. Code is already on GitHub ✅
# 2. Go to railway.app
# 3. Deploy from GitHub
# 4. Done!
```

---

## Troubleshooting

### If Build Fails:
1. Check Railway logs
2. Verify `package.json` has correct scripts
3. Check that all dependencies are listed

### If App Doesn't Start:
1. Check Railway logs
2. Verify `PORT` is used correctly (already set)
3. Check database initialization logs

---

**Ready to deploy on Railway?** Follow the steps above - it's much simpler than Vercel for SQLite!

