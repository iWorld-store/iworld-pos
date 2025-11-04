# Barcode Scanner Setup for macOS

## Common Issues and Solutions

### Issue 1: "Allow This Accessory" Dialog

**Current Status:** macOS is asking to "Allow this accessory" when you plug in the scanner.

**Solution:** 
- Click **"Allow"** or **"Allow Always"** (if available)
- This is macOS's USB Accessory security feature
- Once allowed, the scanner should work immediately
- If you click "Don't Allow", the scanner won't work

**Note:** If you accidentally clicked "Don't Allow" before:
1. Unplug the scanner
2. Go to **System Settings** → **Privacy & Security** → **Security**
3. Look for "USB Accessories" settings
4. Plug the scanner back in and click "Allow" this time

---

### Issue 2: "Keyboard Setup Assistant" Appears

When you plug in a USB barcode scanner on macOS, the system may show a Keyboard Setup Assistant dialog. This is normal - macOS is trying to identify the scanner as a keyboard device.

## Solution Steps:

### Step 1: Complete the Setup Assistant
1. When the "Keyboard Setup Assistant" window appears, click **"Continue"**
2. It will ask you to "Press the key immediately to the right of the left Shift key"
   - **Since barcode scanners don't have this key, press the ESCAPE (Esc) key on your Mac's built-in keyboard**
3. When it says "Keyboard cannot be identified", click **"Skip"**
4. Select **"ANSI (United States and others)"** as the keyboard type
5. Click **"Done"**

### Step 2: Grant Accessibility Permissions (if needed)
1. Go to **System Settings** (or System Preferences on older macOS)
2. Navigate to **Privacy & Security** → **Accessibility**
3. If your scanner app or browser needs permissions, add them here

### Step 3: Test the Scanner
1. Open the POS application in your browser
2. Navigate to "Add to Inventory"
3. Click in the IMEI 1 field
4. Scan a barcode - it should automatically type the IMEI
5. Press Enter (or let the scanner send Enter automatically)
6. The app should automatically move to the next field

## Troubleshooting

### If the Setup Assistant Keeps Appearing:
- **Try a different USB port** - Some ports may be better recognized
- **Unplug and replug** the scanner
- **Restart your Mac** after completing the setup
- Check if your scanner has a **Mac-compatible mode** (some scanners have a switch or setting)

### If Scanner Input Doesn't Work:
- Make sure the **scanner is in "Keyboard Emulation" or "HID" mode** (not USB Serial mode)
- Check that the **field has focus** - click in the input field before scanning
- Verify the scanner is sending **Enter key** after each scan (most scanners do this automatically)
- Try scanning in a text editor (like TextEdit) first to verify the scanner works

### Scanner Configuration Tips:
- Most barcode scanners work in **"Keyboard Wedge" mode** - they act like typing on a keyboard
- The scanner should send an **Enter (Return) key** after each scan automatically
- Some scanners allow you to configure the suffix (Enter, Tab, etc.) - set it to Enter

## How It Works in the POS App

The app automatically detects when:
- **IMEI is scanned** (14-16 digits detected)
- **Enter key is pressed** (sent by scanner after scan)

Then it:
- **Add Inventory**: Validates IMEI and moves to next field
- **Sell Phone**: Automatically searches for the phone
- **Return/Refund**: Automatically searches for the phone

No manual button clicking needed after scanning!

---

## Testing Your Scanner

### Step 1: Test Scanner in Simple App

1. **Open the test page**: Open `scanner-test.html` in your browser
   - Or use any text editor (TextEdit, Notes, etc.)
2. **Click in the input field**
3. **Scan a barcode** - any barcode will work
4. **Check if text appears** - if yes, scanner is working!
5. **Check if Enter is sent** - watch the log for "Enter key detected"

### Step 2: Test IMEI Barcode Format

**IMEI barcodes are typically:**
- **Code 128** or **Code 39** format (most common)
- **14-16 numeric digits**
- Most modern scanners can read these formats

**To test:**
1. Use the `scanner-test.html` page
2. Scan your IMEI barcode
3. Check if it shows as "Valid IMEI format"

### Step 3: Debug in POS App

1. Open the POS app in your browser
2. **Open Developer Console** (Press F12 or Cmd+Option+I)
3. Go to "Add to Inventory"
4. Click in IMEI 1 field
5. Scan a barcode
6. **Watch the console** - you should see:
   - `IMEI1 Input changed: [value]`
   - `IMEI1 Key Press: [key]`
   - `IMEI1 Enter pressed, value: [value]`

### Common Issues:

**Scanner not typing anything:**
- ✅ Scanner is not working or not recognized
- ✅ Scanner is in wrong mode (needs "Keyboard Wedge" or "HID" mode)
- ✅ Field doesn't have focus - click in the field first

**Scanner types but Enter doesn't work:**
- ✅ Scanner may not be configured to send Enter
- ✅ Check scanner manual for "suffix" or "terminator" settings
- ✅ Some scanners need configuration via barcode commands

**Scanner works in TextEdit but not in browser:**
- ✅ Browser security/permissions issue
- ✅ Try different browser
- ✅ Check if browser needs accessibility permissions

**IMEI barcode not readable:**
- ✅ Scanner may not support the barcode format
- ✅ Barcode may be damaged or unclear
- ✅ Try scanning in better lighting
- ✅ Check if scanner supports Code 128/Code 39

