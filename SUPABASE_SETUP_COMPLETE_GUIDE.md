# 🚀 Complete Supabase Setup Guide

Follow these steps **exactly** to set up Supabase for your iPhone POS System.

---

## 📋 Step 1: Get Your Supabase API Keys

### 1.1 Go to Supabase Dashboard
1. Open your browser and go to: **https://supabase.com/dashboard**
2. Log in to your Supabase account
3. You should see your project (or create a new one if you haven't)

### 1.2 Navigate to API Settings
1. In your Supabase project dashboard, look at the **left sidebar**
2. Click on **"Settings"** (gear icon ⚙️)
3. Click on **"API"** (under Project Settings)

### 1.3 Copy Your Credentials
You'll see two important values:

**a) Project URL:**
- Look for **"Project URL"** or **"URL"**
- It looks like: `https://xxxxxxxxxxxxx.supabase.co`
- **Copy this entire URL** (including `https://`)

**b) Anon/Public Key:**
- Look for **"anon public"** or **"anon"** key
- It's a long string starting with `eyJ...`
- **Copy this entire key** (it's very long, make sure you get all of it)

**⚠️ Important:** 
- Don't copy the `service_role` key (that's secret, keep it safe)
- Only copy the **anon/public** key

---

## 📝 Step 2: Create `.env.local` File

### 2.1 Create the File
1. Open your project folder: `/Users/nabeel/Projects/iWorld Store`
2. In the **root** of the project (same level as `package.json`), create a new file
3. Name it exactly: **`.env.local`** (with the dot at the beginning)

### 2.2 Add Your Credentials
Open `.env.local` and paste this template:

```env
NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL_HERE
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
```

**Replace with your actual values:**

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**⚠️ Important:**
- No spaces around the `=` sign
- No quotes around the values
- Make sure there are no extra spaces or line breaks
- Save the file after pasting

---

## 🗄️ Step 3: Create Database Tables

### 3.1 Open SQL Editor
1. In Supabase Dashboard, look at the **left sidebar**
2. Click on **"SQL Editor"** (or "SQL" icon)
3. Click **"New query"** button (top right)

### 3.2 Copy the SQL Schema
1. Open the file `supabase-schema.sql` in your project
2. **Select ALL** the content (Ctrl+A or Cmd+A)
3. **Copy** it (Ctrl+C or Cmd+C)

### 3.3 Paste and Run
1. Go back to Supabase SQL Editor
2. **Paste** the SQL code (Ctrl+V or Cmd+V)
3. Click the **"Run"** button (or press Ctrl+Enter / Cmd+Enter)
4. Wait for the success message: **"Success. No rows returned"** ✅

**⚠️ If you see errors:**
- Make sure you copied the ENTIRE file
- Check that there are no syntax errors
- Try running it again

### 3.4 Verify Tables Were Created
1. In Supabase Dashboard, click **"Table Editor"** (left sidebar)
2. You should see **5 tables**:
   - ✅ `phones`
   - ✅ `sales`
   - ✅ `returns`
   - ✅ `credits`
   - ✅ `credit_payments`

If you see all 5 tables, you're good! ✅

---

## ✅ Step 4: Test the Setup

### 4.1 Start the Development Server
Open terminal in your project folder and run:

```bash
npm run dev
```

### 4.2 Open the App
1. Open your browser
2. Go to: **http://localhost:3000**
3. You should see the login page

### 4.3 Login
1. Enter password: **`iWorld007xzaidali@`**
2. Click "Login"
3. **First time:** It will create your account in Supabase automatically
4. You should be redirected to the Dashboard

### 4.4 Test Adding a Phone
1. Click **"Add Inventory"**
2. Fill in the form and add a phone
3. Check Supabase Dashboard → Table Editor → `phones` table
4. You should see your phone data! ✅

---

## 🚨 Troubleshooting

### Problem: "Supabase credentials not found"
**Solution:** 
- Check that `.env.local` exists in the project root
- Check that the file has the correct variable names
- Make sure there are no typos
- Restart the dev server (`npm run dev`)

### Problem: "User not authenticated" errors
**Solution:**
- Make sure you ran the SQL schema (Step 3)
- Check that all 5 tables exist in Supabase
- Try logging out and logging back in

### Problem: Build errors
**Solution:**
- Make sure `.env.local` exists before building
- The build will work once you add the environment variables
- For production, add these same variables to Vercel

### Problem: Can't find API keys in Supabase
**Solution:**
- Make sure you're in the correct project
- Go to: Settings → API
- Look for "Project URL" and "anon public" key
- If you don't see them, you might need to create a new project

---

## 📦 Step 5: Deploy to Vercel (Optional)

When you're ready to deploy:

### 5.1 Push to GitHub
```bash
git add .
git commit -m "Add Supabase integration"
git push
```

### 5.2 Add Environment Variables in Vercel
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add these two variables:
   - **Name:** `NEXT_PUBLIC_SUPABASE_URL`
     **Value:** `https://your-project-id.supabase.co`
   - **Name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     **Value:** `your-anon-key-here`
3. Click "Save"
4. Redeploy your project

---

## ✅ Checklist

Before you start using the app, make sure:

- [ ] Created `.env.local` file in project root
- [ ] Added `NEXT_PUBLIC_SUPABASE_URL` with your project URL
- [ ] Added `NEXT_PUBLIC_SUPABASE_ANON_KEY` with your anon key
- [ ] Ran `supabase-schema.sql` in Supabase SQL Editor
- [ ] Verified all 5 tables exist in Supabase Table Editor
- [ ] Tested login with password: `iWorld007xzaidali@`
- [ ] Successfully added a phone to inventory
- [ ] Can see data in Supabase Dashboard

---

## 🎉 You're Done!

Once you complete all steps, your app will:
- ✅ Store all data in Supabase cloud database
- ✅ Allow login from any device
- ✅ Sync data across all devices
- ✅ Work offline (with sync when online)
- ✅ Have all your new features (resale tracking, credit payments, etc.)

---

## 📞 Need Help?

If you get stuck:
1. Check the error message in the browser console (F12)
2. Check Supabase Dashboard → Logs for any errors
3. Make sure all steps were completed correctly
4. Try restarting the dev server

---

**Good luck! 🚀**

