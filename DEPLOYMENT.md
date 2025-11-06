# Deployment Guide

## Prerequisites

1. GitHub account
2. Vercel account (free tier works)

## Step 1: Set up GitHub

1. Create a new repository on GitHub
2. Push your code to GitHub:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/your-repo.git
git push -u origin main
```

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. Click "Deploy" (no environment variables needed!)

## Step 3: Install PWA

1. Visit your Vercel URL
2. Look for the install prompt in your browser
3. Click "Install" or "Add to Home Screen"
4. The app will now work offline!

## Step 4: Create App Icons (Optional)

Create two icon files:
- `public/icon-192x192.png` (192x192 pixels)
- `public/icon-512x512.png` (512x512 pixels)

You can use any image editor or online tool to create these icons.

## Troubleshooting

### Service Worker not working
- Make sure you're accessing the site via HTTPS (Vercel provides this automatically)
- Clear browser cache and reload

### Backup & Restore
- Use the Dashboard to export backups regularly
- Store backup files in cloud storage (Google Drive, Dropbox, etc.)
- Import backups will replace all existing data - export first!

### Offline mode not working
- Make sure service worker is registered (check browser DevTools > Application > Service Workers)
- Clear cache and reload the page

## Password

Default password: `iWorld007xzaidali@`

You can change this in `src/lib/auth.ts` by modifying the `PASSWORD` constant.

