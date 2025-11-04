# Railway Deployment - Private POS (Recommended)

## Why Railway?

✅ **Supports SQLite** - Persistent storage  
✅ **Private deployments** - Password protection  
✅ **GitHub integration** - Easy deployment  
✅ **Free tier available** - Good for small apps  
✅ **Simple setup** - No complex configuration  

---

## Setup Steps

### 1. Create Private GitHub Repository

```bash
cd "/Users/nabeel/Projects/iWorld Store"

# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create private repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/iworld-store-pos.git
git branch -M main
git push -u origin main
```

### 2. Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your private repository
6. Railway auto-detects Node.js

### 3. Configure Build

Railway will automatically:
- Detect `package.json`
- Run `npm install`
- Run start script

**Update package.json:**
```json
{
  "scripts": {
    "start": "node dist/server/index.js",
    "build": "npm run build:server && npm run build:react",
    "build:server": "tsc --project tsconfig.server.json",
    "build:react": "vite build"
  }
}
```

### 4. Set Environment Variables

In Railway dashboard:
- **PORT**: Railway sets automatically (use `process.env.PORT`)
- Any other env vars you need

### 5. Update Server to Use Railway's PORT

Update `server/index.ts`:
```typescript
const PORT = process.env.PORT || 3001;
```

### 6. Make It Private

**Option A: Password Protection**
- Add middleware to require password
- Or use Railway's built-in auth

**Option B: Private Domain**
- Railway gives you a random URL
- Don't share publicly
- Only give to authorized people

**Option C: Custom Domain + Password**
- Add custom domain
- Add password protection
- Maximum privacy

---

## Database (SQLite)

Railway supports persistent storage:
- SQLite file persists between deployments
- Database stored in Railway's volume
- No changes needed to your code

---

## Deployment Process

1. **Push to GitHub** → Railway auto-deploys
2. **Get URL** → Railway provides: `yourapp.railway.app`
3. **Share privately** → Only give URL to authorized people
4. **Add password** → Optional extra security

---

## Security Features

✅ **Private GitHub repo** - Code is private  
✅ **Private Railway deployment** - URL not public  
✅ **Password protection** - Optional middleware  
✅ **Custom domain** - Optional, more privacy  
✅ **HTTPS by default** - Secure connection  

---

## Quick Start

```bash
# 1. Push to GitHub (private repo)
git add .
git commit -m "Ready for Railway"
git push

# 2. Deploy on Railway
# - Go to railway.app
# - Connect GitHub repo
# - Deploy automatically

# 3. Get private URL
# - Railway gives you: yourapp.railway.app
# - Share only with authorized people
```

---

## Cost

- **Free tier**: $5 credit/month
- **Hobby plan**: $5/month (if needed)
- **Perfect for small POS** - Usually free

---

**Ready to deploy?** I can help you set it up step by step!

