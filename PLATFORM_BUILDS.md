# Cross-Platform Build Guide

## Current Status

**Currently configured for**: Windows only  
**Can build for**: Windows, macOS, and Linux

---

## Building for Different Platforms

### Windows (Current)
```bash
npm run package:win
```
**Output**: `release/iWorld Store POS Setup.exe` (NSIS installer)

### macOS
```bash
npm run package:mac
```
**Output**: `release/iWorld Store POS.dmg` (Disk image)

### Linux
```bash
npm run package:linux
```
**Output**: 
- `release/iWorld Store POS.AppImage` (Portable)
- `release/iWorld Store POS.deb` (Debian/Ubuntu installer)

### All Platforms
```bash
npm run package:all
```
**Output**: Builds for all platforms (requires building on each platform)

---

## Important Notes

### ⚠️ Platform-Specific Building

**Electron-builder must build on the target platform:**

- **Windows builds** → Must build on Windows
- **macOS builds** → Must build on macOS
- **Linux builds** → Can build on Windows/macOS/Linux

### Options:

1. **Build on each platform** (if you have access)
   - Build Windows installer on Windows
   - Build macOS DMG on Mac
   - Build Linux on any platform

2. **Use GitHub Actions** (CI/CD)
   - Automatic builds for all platforms
   - No need for multiple machines
   - Free for public repos

3. **Build on your Mac for Windows**
   - ❌ **Not possible** - Windows installers require Windows
   - ❌ **Not possible** - macOS DMGs require macOS

---

## What's Configured

### Windows
- ✅ NSIS installer (`.exe`)
- ✅ Desktop shortcut
- ✅ Start menu shortcut
- ✅ Custom installation directory

### macOS
- ✅ DMG disk image
- ✅ App category: Business
- ⚠️ Needs `build/icon.icns` file

### Linux
- ✅ AppImage (portable, no install)
- ✅ DEB package (Debian/Ubuntu)
- ⚠️ Needs `build/icon.png` file

---

## Quick Reference

| Platform | Build Command | Output File | Icon Needed |
|----------|--------------|-------------|-------------|
| **Windows** | `npm run package:win` | `.exe` | `build/icon.ico` |
| **macOS** | `npm run package:mac` | `.dmg` | `build/icon.icns` |
| **Linux** | `npm run package:linux` | `.AppImage` / `.deb` | `build/icon.png` |

---

## Recommendations

### For Your Customer (Windows):
1. Build Windows installer: `npm run package:win`
2. Deliver: `iWorld Store POS Setup.exe`

### If Customer Needs macOS:
1. Build on Mac: `npm run package:mac`
2. Deliver: `iWorld Store POS.dmg`

### If Customer Needs Linux:
1. Build anywhere: `npm run package:linux`
2. Deliver: `.AppImage` (portable) or `.deb` (installer)

---

## Next Steps

1. **If customer is Windows only**: ✅ You're done! Use `npm run package:win`
2. **If customer needs macOS**: Build on Mac or use CI/CD
3. **If customer needs Linux**: Can build on your Mac

---

**Current setup is Windows-only, but can easily build for other platforms!**

