# Installation Fix Guide for better-sqlite3

## Problem
The `better-sqlite3` package is failing to compile on macOS ARM64 with Node.js 24.7.0 because:
1. No prebuilt binaries available for this Node.js version
2. Native compilation is failing
3. Build tools may not be properly configured

## Solutions (Try in order)

### Solution 1: Clean Install (Recommended - Try this first)

```bash
# Remove existing node_modules and lock files
rm -rf node_modules
rm -f package-lock.json

# Clear npm cache
npm cache clean --force

# Install dependencies
npm install
```

### Solution 2: Ensure Build Tools Are Installed

`better-sqlite3` requires Xcode Command Line Tools for native compilation:

```bash
# Check if Xcode Command Line Tools are installed
xcode-select -p

# If it returns an error, install them:
xcode-select --install

# Wait for installation to complete, then try npm install again
npm install
```

### Solution 3: Install with Specific Flags

If Solution 1 doesn't work, try installing with verbose output to see what's happening:

```bash
# Install with verbose output
npm install --verbose

# Or try with legacy peer deps
npm install --legacy-peer-deps

# Or rebuild better-sqlite3 specifically
npm install better-sqlite3 --build-from-source
```

### Solution 4: Use Node.js LTS Version (If above solutions fail)

Node.js 24.7.0 is very new. `better-sqlite3` may work better with Node.js LTS (20.x):

```bash
# Install nvm (Node Version Manager) if not already installed
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.1/install.sh | bash

# Restart terminal or source the profile
source ~/.zshrc  # or ~/.bash_profile

# Install Node.js LTS (20.x)
nvm install --lts

# Use LTS version
nvm use --lts

# Verify version
node -v  # Should show v20.x.x

# Now try npm install
npm install
```

### Solution 5: Install Python and Build Tools (If still failing)

Ensure Python 3 is available (better-sqlite3 needs it for compilation):

```bash
# Check Python version
python3 --version

# If not installed, install via Homebrew:
brew install python3

# Ensure npm can find Python
npm config set python python3
```

## What Changed

I've updated `better-sqlite3` from version `^9.4.0` to `^11.7.0` which has:
- Better support for newer Node.js versions
- Improved ARM64 macOS compatibility
- More prebuilt binaries available

## Verification

After successful installation, verify it worked:

```bash
# Check if better-sqlite3 compiled correctly
node -e "require('better-sqlite3'); console.log('better-sqlite3 loaded successfully!')"

# If you see "better-sqlite3 loaded successfully!" - you're good!
```

## If All Solutions Fail

As a last resort, we can switch to `sql.js` (pure JavaScript SQLite, no compilation needed), but this requires code changes and is slower than better-sqlite3.

