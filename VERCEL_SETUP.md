# Vercel Deployment Setup - Step by Step

## ⚠️ CRITICAL WARNING: SQLite on Vercel

**Vercel is serverless** - SQLite files stored in `/tmp` will be **DELETED** on each deployment.

**Data will NOT persist** - All inventory data will be lost when Vercel redeploys.

### Solutions:
1. **Use Railway instead** (recommended - supports persistent SQLite)
2. **Migrate to cloud database** (Supabase, PlanetScale, etc.)
3. **Accept data loss** (not recommended for production)

---

## Step-by-Step Setup

### Step 1: Push Code to GitHub

```bash
cd "/Users/nabeel/Projects/iWorld Store"

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - POS application"

# Add remote (replace YOUR_USERNAME and REPO_NAME)
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Push to GitHub
git branch -M main
git push -u origin main
```

**What I need from you:**
- GitHub username
- Repository name (or create it first and give me the name)

---

### Step 2: Configure Vercel

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your client's GitHub account
3. **Click "Add New Project"**
4. **Import your GitHub repository**
5. **Configure Build Settings**:
   - Framework Preset: **Other**
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build:vercel`
   - Output Directory: `dist/react`
   - Install Command: `npm install`

6. **Environment Variables** (if needed):
   - Go to Project Settings → Environment Variables
   - Add any required variables

7. **Click "Deploy"**

---

### Step 3: Make It Private

**Option A: Password Protection**
1. Go to Project Settings → Deployment Protection
2. Enable "Password Protection"
3. Set a strong password
4. Only people with password can access

**Option B: Private Domain**
1. Vercel gives you: `yourapp.vercel.app`
2. Don't share publicly
3. Only give URL to authorized people

**Option C: Custom Domain + Password**
1. Add custom domain in Vercel
2. Enable password protection
3. Maximum privacy

---

## What I Need From You

1. **GitHub Repository**:
   - Username: `?`
   - Repository name: `?`
   - Is it already created? Yes/No

2. **Vercel Account**:
   - Is it connected to GitHub? Yes/No
   - Do you want password protection? Yes/No

3. **Database Decision**:
   - ⚠️ SQLite won't persist on Vercel
   - Options:
     a) Use Railway instead (recommended)
     b) Migrate to cloud database
     c) Accept data loss (not recommended)

---

## Quick Start Commands

Once you give me the GitHub details, I'll help you:

```bash
# 1. Initialize and push
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USERNAME/REPO.git
git push -u origin main

# 2. Deploy on Vercel
# - Go to vercel.com
# - Import repository
# - Configure build settings
# - Deploy!
```

---

## Next Steps

**Please provide:**
1. GitHub username
2. Repository name (or should I create one?)
3. Decision on database (Railway vs Vercel vs Cloud DB)

Once I have these, I'll guide you through the exact steps!

