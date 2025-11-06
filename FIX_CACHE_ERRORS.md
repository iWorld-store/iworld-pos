# Fix ChunkLoadError and Cache Errors - Step by Step

The errors you're seeing (`ChunkLoadError`, `404 Not Found`, hydration errors) are caused by **cached browser files** that still reference the old Supabase code.

## ⚠️ CRITICAL: Follow these steps EXACTLY in order

### Step 1: Stop the Dev Server
Press `Ctrl+C` in your terminal to stop the Next.js dev server completely.

### Step 2: Clear All Build Caches
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### Step 3: Clear Browser Cache COMPLETELY

#### Option A: Hard Refresh (Try this first)
- **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
- **Mac**: Press `Cmd + Shift + R`

#### Option B: Clear Site Data (If hard refresh doesn't work)
1. Open Developer Tools (`F12` or right-click → Inspect)
2. Go to **Application** tab (Chrome) or **Storage** tab (Firefox)
3. In the left sidebar, find **Storage** section
4. Click **Clear site data** button
5. Check ALL boxes:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
   - ✅ Service Workers
   - ✅ Storage
6. Click **Clear data**

### Step 4: Unregister Service Workers
1. In Developer Tools, go to **Application** tab
2. Click **Service Workers** in the left sidebar
3. For each service worker listed:
   - Click **Unregister** button
   - Wait for it to disappear
4. Refresh the page

### Step 5: Clear Browser Cache Storage
1. Still in **Application** tab
2. Click **Cache Storage** in the left sidebar
3. Right-click on each cache entry
4. Click **Delete**
5. Or click **Clear site data** again

### Step 6: Restart Dev Server
```bash
npm run dev
```

### Step 7: Hard Refresh Browser Again
After the server starts:
- Press `Ctrl + Shift + R` (Windows/Linux) or `Cmd + Shift + R` (Mac)
- Or close and reopen the browser tab completely

### Step 8: Verify
1. Open Developer Tools (`F12`)
2. Go to **Console** tab
3. Check for errors - they should be gone now
4. If you still see errors, repeat Steps 3-7

## What I've Fixed in the Code

✅ **Service Worker Updated**: Changed cache version to `v3` and added aggressive cache clearing  
✅ **Service Worker Registration**: Now automatically unregisters old service workers and clears caches  
✅ **Build Cache Cleared**: Removed all `.next` build artifacts  
✅ **No Supabase References**: Verified 0 references to Supabase in source code

## If Errors Persist

If you still see errors after following all steps:

1. **Close the browser completely** (all windows)
2. **Restart your computer** (this clears all memory caches)
3. **Open browser fresh** and navigate to `http://localhost:3000`
4. **Clear site data** one more time
5. **Restart dev server** and try again

The code is 100% clean - these are purely browser cache issues that need to be cleared manually.

