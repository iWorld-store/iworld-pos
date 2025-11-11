# GitHub Push Instructions

## Authentication Issue

You're currently authenticated as `nbyeel` but need to push to `iWorld-store/iworld-pos`.

## Solution Options

### Option 1: Use Personal Access Token (Recommended)

1. **Create a Personal Access Token:**
   - Go to: https://github.com/settings/tokens
   - Click "Generate new token" → "Generate new token (classic)"
   - Name: `iworld-pos-deployment`
   - Expiration: Choose your preference (90 days recommended)
   - Scopes: Check `repo` (full control of private repositories)
   - Click "Generate token"
   - **Copy the token immediately** (you won't see it again!)

2. **Push using the token:**
   ```bash
   git push https://YOUR_TOKEN@github.com/iWorld-store/iworld-pos.git main
   ```
   Replace `YOUR_TOKEN` with the token you just created.

### Option 2: Update Git Credentials

1. **Clear cached credentials:**
   ```bash
   git credential-osxkeychain erase
   host=github.com
   protocol=https
   ```
   (Press Enter twice)

2. **Push again:**
   ```bash
   git push -u origin main
   ```
   When prompted, enter:
   - Username: `iWorld-store` (or your GitHub username)
   - Password: Your Personal Access Token (not your GitHub password)

### Option 3: Use SSH (Alternative)

1. **Change remote to SSH:**
   ```bash
   git remote set-url origin git@github.com:iWorld-store/iworld-pos.git
   ```

2. **Set up SSH key** (if not already done):
   - Follow: https://docs.github.com/en/authentication/connecting-to-github-with-ssh

3. **Push:**
   ```bash
   git push -u origin main
   ```

## Quick Fix (Easiest)

If you have access to the `iWorld-store` GitHub account, the easiest way is:

1. Go to: https://github.com/settings/tokens
2. Generate a new token with `repo` scope
3. Run:
   ```bash
   git push https://YOUR_TOKEN@github.com/iWorld-store/iworld-pos.git main
   ```

---

**After successful push, proceed to Vercel deployment!**

