# Quick Start Guide - Web App Version

## 🚀 Starting the Application

### Option 1: Single Command (Recommended)
```bash
npm run dev
```

This starts:
- Express server on `http://localhost:3001`
- React app on `http://localhost:3000`

### Option 2: Separate Terminals

**Terminal 1 - Server:**
```bash
npm run dev:server:watch
```

**Terminal 2 - React:**
```bash
npm run dev:react
```

## 🌐 Accessing the App

1. Open your browser (Chrome, Safari, Firefox - any browser works!)
2. Go to: `http://localhost:3000`
3. That's it! No Electron window needed.

## ✅ What Changed

- ✅ No more Electron window issues
- ✅ Works in any browser
- ✅ Same functionality (SQLite, exports, everything)
- ✅ Works on Mac, Windows, Linux
- ✅ Easier development

## 🔧 Architecture

```
Browser (localhost:3000)
    ↓
Express API (localhost:3001)
    ↓
SQLite Database (local file)
```

## 📝 Notes

- Database location: `~/.local/share/iWorldStore/database.db` (Mac/Linux)
- Exports location: `~/Documents/iWorldStore/` (CSV/Excel files)
- Server runs on port 3001
- React app runs on port 3000 (proxies API calls)

