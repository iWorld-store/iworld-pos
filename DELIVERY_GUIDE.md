# Delivery Guide - iWorld Store POS

## Overview

The POS is now packaged as a **professional desktop application** using Electron. Your customer will receive a single Windows installer (`.exe`) that they can install and run like any other software - no terminal or technical knowledge needed!

---

## How It Works

1. **Customer installs** the `.exe` file (like installing any Windows software)
2. **Desktop shortcut** is created automatically
3. **Customer double-clicks** the shortcut
4. **App opens** in a desktop window (no browser needed)
5. **Everything just works** - server starts automatically in the background

---

## Building the Installer (For You)

### Prerequisites
- Node.js (v18+) installed
- Windows machine (or use GitHub Actions for cross-platform)

### Steps

1. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

2. **Build the application**:
   ```bash
   npm run build
   ```
   This compiles:
   - Express server (TypeScript → JavaScript)
   - React app (production build)
   - Electron main process (TypeScript → JavaScript)

3. **Create Windows installer**:
   ```bash
   npm run package:win
   ```

4. **Find the installer**:
   - Location: `release/iWorld Store POS Setup.exe`
   - Size: ~100-150MB (includes Electron runtime)

---

## What to Deliver to Customer

### Single File Delivery:
- **`iWorld Store POS Setup.exe`** (from `release/` folder)

### Optional: Include README
Create a simple `INSTALLATION.txt`:
```
iWorld Store POS - Installation Instructions

1. Double-click "iWorld Store POS Setup.exe"
2. Follow the installation wizard
3. Click "Install"
4. Launch "iWorld Store POS" from desktop or Start menu

That's it! The app will open automatically.

For support, contact: [your contact info]
```

---

## Customer Experience

### Installation:
1. Customer receives `.exe` file
2. Double-clicks to install
3. Installs like any Windows software
4. Creates desktop shortcut automatically

### Usage:
1. Customer double-clicks desktop icon
2. App window opens (no browser, no terminal)
3. Uses the POS normally
4. Closes window when done

### No Technical Knowledge Required:
- ✅ No Node.js installation needed
- ✅ No terminal/command prompt needed
- ✅ No browser opening needed
- ✅ Just install and use!

---

## Development vs Production

### Development (Your Machine):
```bash
npm run dev
```
- Runs Express server + React dev server
- Opens in browser at `http://localhost:3000`
- Hot reload enabled

### Production (Customer):
- Single `.exe` installer
- Installs desktop app
- Server runs automatically in background
- No visible terminal or browser

---

## Troubleshooting

### If installer fails to build:
1. Make sure all dependencies are installed: `npm install`
2. Check that `npm run build` completes successfully
3. Ensure you have enough disk space (~500MB free)

### If customer has issues:
1. **App won't start**: Check Windows Event Viewer for errors
2. **Port already in use**: Restart computer (port 3001 might be in use)
3. **Database errors**: Check write permissions in user's AppData folder

### Building for Different Platforms:
- **Windows**: `npm run package:win` (creates `.exe`)
- **macOS**: `npm run package:mac` (creates `.dmg`)
- **Linux**: `npm run package:linux` (creates `.AppImage`)

---

## File Structure After Build

```
release/
├── iWorld Store POS Setup.exe  ← Give this to customer
└── (other build artifacts)
```

---

## Next Steps

1. ✅ Build the installer: `npm run package:win`
2. ✅ Test the installer on a clean Windows machine
3. ✅ Create installation instructions
4. ✅ Deliver to customer

**That's it!** Your customer gets a professional desktop application.

