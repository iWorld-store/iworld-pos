# Quick Start Guide

## First Time Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run in Development Mode**
   ```bash
   npm run dev
   ```
   
   This will automatically:
   - Start the React development server
   - Compile the Electron main process
   - Launch the application window

## Usage

### Adding Inventory

1. Press **F1** or click "Add Inventory"
2. Scan or type IMEI1 (required)
3. Optionally scan or type IMEI2
4. Fill in phone details
5. Click "Save" or press **Ctrl+Enter**

### Selling a Phone

1. Press **F2** or click "Sell Phone"
2. Scan or type IMEI
3. Tab out of the field or click "Search"
4. Review phone details
5. Enter sale price and customer info
6. Click "Confirm Sale"

### Processing a Return

1. Press **F3** or click "Return/Refund"
2. Scan or type IMEI
3. Tab out or click "Search"
4. Review sale details
5. Enter return reason and refund amount
6. Click "Process Return"

### Viewing Inventory

1. Press **F4** or click "Inventory"
2. Use the search bar to find phones by IMEI or model
3. Filter by status using the dropdown
4. Click the eye icon to view details
5. Click the pencil icon to edit (only for in-stock phones)
6. Click the trash icon to delete (only for never-sold phones)

### Running Reports

1. Press **F5** or click "Reports"
2. Select "Profit Report" or "Inventory Report"
3. For profit reports, select a time period
4. View metrics and export if needed

## Keyboard Shortcuts Summary

- **F1** - Add to Inventory
- **F2** - Sell Phone
- **F3** - Return/Refund
- **F4** - View Inventory
- **F5** - Reports
- **Ctrl+Enter** - Submit forms
- **Ctrl+F** - Focus search (inventory view)
- **ESC** - Close dialogs

## Barcode Scanner

The application works with USB barcode scanners that emulate keyboard input:
1. Ensure the IMEI input field has focus
2. Scan the barcode
3. The IMEI will be automatically entered

No special drivers or configuration needed!

## Database Location

- **Windows**: `C:\Users\[YourUsername]\AppData\Local\iWorldStore\database.db`
- **macOS/Linux**: `~/.local/share/iWorldStore/database.db`

Backups are stored in a `backups` subdirectory.

## Building for Production

```bash
npm run build
npm run package:win
```

The installer will be in the `release` directory.

## Troubleshooting

### Dependencies won't install
- On Windows, ensure you have Visual Studio Build Tools installed
- Try running `npm install --build-from-source` for better-sqlite3

### Database errors
- Check that the application has write permissions in the database directory
- The database is created automatically on first run

### Electron won't start
- Make sure you've run `npm install`
- Try deleting `node_modules` and reinstalling

