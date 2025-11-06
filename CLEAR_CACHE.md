# How to Clear Cache and Fix Supabase Errors

The errors you're seeing are from **cached browser files**. Follow these steps:

## Step 1: Stop the Dev Server
Press `Ctrl+C` in your terminal to stop the Next.js dev server.

## Step 2: Clear Browser Cache

### Option A: Hard Refresh (Quick)
- **Chrome/Edge (Windows/Linux)**: `Ctrl + Shift + R` or `Ctrl + F5`
- **Chrome/Edge (Mac)**: `Cmd + Shift + R`
- **Firefox**: `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- **Safari**: `Cmd + Option + R`

### Option B: Clear Cache Completely
1. Open Developer Tools (`F12` or `Right-click > Inspect`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Clear storage** or **Clear site data**
4. Check all boxes and click **Clear site data**

## Step 3: Unregister Service Worker (Important!)
1. Open Developer Tools (`F12`)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. Click **Service Workers** in the left sidebar
4. Click **Unregister** next to any registered service workers
5. Refresh the page

## Step 4: Restart Dev Server
```bash
npm run dev
```

## Step 5: Hard Refresh Again
After the server starts, do another hard refresh (`Ctrl + Shift + R` or `Cmd + Shift + R`)

---

**Note**: The service worker cache version has been updated to `v2`, which will automatically clear old cached files on the next visit. But you still need to clear the current cache manually the first time.

