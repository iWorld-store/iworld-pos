# iPhone POS System

A Progressive Web App (PWA) for managing phone inventory and sales with full offline capability.

## Features

- ✅ Offline-first architecture (100% offline functionality)
- ✅ PWA (installable app-like experience)
- ✅ IMEI barcode scanning support
- ✅ Inventory management
- ✅ Sales processing with receipts
- ✅ Return/refund handling
- ✅ Comprehensive reports and analytics
- ✅ CSV/Excel export
- ✅ JSON backup/restore (manual backups)
- ✅ Dark mode UI
- ✅ Password protection

## Tech Stack

- Next.js 14
- TypeScript
- IndexedDB (Dexie.js) for offline storage
- Tailwind CSS
- Zustand for state management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Run development server:
```bash
npm run dev
```

3. Build for production:
```bash
npm run build
npm start
```

## Backup & Restore

The app includes a built-in backup system:
- **Export Backup**: Export all data (phones, sales, returns) to a JSON file
- **Import Backup**: Restore data from a previously exported JSON file
- Access backup features from the Dashboard

💡 **Tip**: Export backups regularly and store them in a safe place (Google Drive, Dropbox, etc.)

## Deployment

Deploy to Vercel:
1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variables
4. Deploy automatically

## Password

Default password: `iWorld007xzaidali@`

