# Vercel Deployment - Step by Step

## ✅ Step 1: Code Pushed to GitHub

Your code is now on GitHub: https://github.com/iWorld-store/iworld

---

## Step 2: Deploy to Vercel

### 1. Go to Vercel
- Visit: https://vercel.com
- Sign in with your **client's GitHub account** (iWorld-store)

### 2. Import Project
- Click **"Add New Project"**
- You'll see your repositories
- Click **"Import"** next to `iworld` repository

### 3. Configure Project

**Framework Preset:** 
- Select **"Other"** or **"Vite"**

**Build Settings:**
- **Root Directory:** `./` (leave default)
- **Build Command:** `npm run build:vercel`
- **Output Directory:** `dist/react`
- **Install Command:** `npm install`

**Environment Variables:**
- None needed for now (can add later if required)

### 4. Deploy
- Click **"Deploy"**
- Wait for build to complete (2-3 minutes)

### 5. Get Your URL
- Vercel will give you: `iworld-xxx.vercel.app`
- This is your private URL

---

## Step 3: Make It Private

### Option A: Password Protection (Recommended)

1. Go to **Project Settings** → **Deployment Protection**
2. Enable **"Password Protection"**
3. Set a strong password
4. Save

Now only people with the password can access your POS.

### Option B: Keep URL Private

- Don't share the Vercel URL publicly
- Only give it to authorized people
- Vercel URLs are not publicly listed

### Option C: Custom Domain + Password

1. Add custom domain in Vercel
2. Enable password protection
3. Maximum privacy

---

## ⚠️ Important: SQLite Issue

**Vercel is serverless** - SQLite data stored in `/tmp` will be **DELETED** on each deployment.

**This means:**
- ❌ All inventory data will be lost when Vercel redeploys
- ❌ Not suitable for production with SQLite

**Solutions:**
1. **Use Railway instead** (recommended - SQLite works)
2. **Migrate to cloud database** (Supabase, PlanetScale)
3. **Accept data loss** (not recommended)

---

## Next Steps After Deployment

1. ✅ Test the deployed app
2. ✅ Set up password protection
3. ✅ Share URL only with authorized people
4. ⚠️ Decide on database solution (SQLite won't persist)

---

## Quick Reference

**GitHub Repo:** https://github.com/iWorld-store/iworld  
**Vercel Dashboard:** https://vercel.com/dashboard  
**Deploy URL:** Will be shown after deployment

---

**Ready to deploy on Vercel?** Follow the steps above!

