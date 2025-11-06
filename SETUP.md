# Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   - Open [http://localhost:3000](http://localhost:3000)

5. **Login**
   - Password: `iWorld007xzaidali@`

## Creating App Icons

The PWA requires icon files. Create these files in the `public` folder:

1. **icon-192x192.png** - 192x192 pixels
2. **icon-512x512.png** - 512x512 pixels

You can:
- Use any image editor (Photoshop, GIMP, etc.)
- Use online tools like [favicon.io](https://favicon.io)
- Use a simple logo or app icon design

## Features

✅ **Offline-First**: Works 100% offline, no internet required
✅ **PWA**: Installable app-like experience
✅ **IMEI Scanning**: Barcode scanner support
✅ **Inventory Management**: Add, view, search phones
✅ **Sales Processing**: Complete sales with receipts
✅ **Returns/Refunds**: Handle returns and update inventory
✅ **Reports**: Comprehensive analytics and profit tracking
✅ **Data Export**: CSV/Excel export functionality
✅ **Backup & Restore**: JSON backup/import for data safety
✅ **Dark Mode**: Professional dark theme

## Barcode Scanner Setup

1. Connect your USB barcode scanner
2. Ensure it's in "keyboard wedge" mode (default)
3. Scan IMEI barcodes - they will auto-fill in the input fields
4. Press Enter after scanning to proceed

## Deployment

See `DEPLOYMENT.md` for detailed deployment instructions to Vercel.

## Troubleshooting

### Service Worker Issues
- Clear browser cache
- Check browser console for errors
- Ensure HTTPS is enabled (required for PWA)

### Backup & Restore
- Export backups regularly from the Dashboard
- Store backup files in a safe location (Google Drive, Dropbox, etc.)
- Import backups will replace all existing data (make sure to export first!)

### Offline Mode Not Working
- Open DevTools > Application > Service Workers
- Verify service worker is registered
- Check "Offline" checkbox in DevTools to test

## Password Change

To change the password, edit `src/lib/auth.ts`:
```typescript
const PASSWORD = 'your_new_password';
```

