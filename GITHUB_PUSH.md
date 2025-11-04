# Push to GitHub - Authentication Fix

## Issue

Git is using the wrong GitHub account (`nbyeel` instead of `iWorld-store`).

## Solution

You need to authenticate with the correct GitHub account. Here are the options:

---

## Option 1: Use GitHub CLI (Recommended)

```bash
# Install GitHub CLI (if not installed)
brew install gh

# Login with iWorld-store account
gh auth login

# Follow prompts:
# - GitHub.com
# - HTTPS
# - Login with a web browser
# - Use iWorld-store account
```

Then push:
```bash
git push -u origin main
```

---

## Option 2: Use Personal Access Token

1. **Create Token on GitHub:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token (classic)"
   - Name: `iWorld Store POS`
   - Expiration: `90 days` (or your choice)
   - Scopes: Check `repo` (all)
   - Click "Generate token"
   - **Copy the token** (you won't see it again!)

2. **Push with Token:**
```bash
# When prompted for password, use the token
git push -u origin main

# Username: iWorld-store
# Password: [paste your token]
```

---

## Option 3: Update Git Credentials

```bash
# Remove old credentials
git config --global --unset credential.helper
git credential-osxkeychain erase
host=github.com
protocol=https
[Press Enter twice]

# Then push (will prompt for new credentials)
git push -u origin main
```

---

## Quick Fix - Try This First

```bash
cd "/Users/nabeel/Projects/iWorld Store"

# Try pushing again (will prompt for credentials)
git push -u origin main
```

When prompted:
- **Username**: `iWorld-store`
- **Password**: Use a Personal Access Token (not your GitHub password)

---

## After Success

Once pushed, you'll see:
```
Enumerating objects: 53, done.
Counting objects: 100% (53/53), done.
...
To https://github.com/iWorld-store/iworld.git
 * [new branch]      main -> main
```

Then proceed to Vercel deployment!

---

**Need help?** Let me know which method you prefer and I'll guide you through it!

