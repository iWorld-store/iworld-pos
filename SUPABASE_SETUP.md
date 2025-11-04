# Supabase Setup Guide - iWorld Store POS

## ✅ Why Supabase?

- **Free tier** - Perfect for small apps
- **Works on ANY platform** - Vercel, Railway, Netlify, etc.
- **PostgreSQL database** - Industry standard, reliable
- **No native modules** - Pure JavaScript, works everywhere
- **Real-time** (optional) - Can add real-time updates later
- **Auto-scaling** - Handles growth automatically

---

## Step 1: Create Supabase Account

1. Go to **https://supabase.com**
2. Click **"Start your project"**
3. Sign up with GitHub (or email)
4. Create a new project

---

## Step 2: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor**
2. Click **"New query"**
3. Copy and paste the contents of **`supabase-schema.sql`**
4. Click **"Run"**
5. Tables will be created automatically ✅

---

## Step 3: Get Your API Keys

1. In Supabase dashboard, go to **Settings** → **API**
2. Copy these values:
   - **Project URL** (this is your `SUPABASE_URL`)
   - **anon/public key** (this is your `SUPABASE_ANON_KEY`)

---

## Step 4: Set Environment Variables

### For Local Development:

Create a `.env` file in the project root:

```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
```

### For Vercel/Railway/Other Platforms:

1. Go to your platform's dashboard
2. Navigate to **Environment Variables**
3. Add:
   - `SUPABASE_URL` = Your Supabase project URL
   - `SUPABASE_ANON_KEY` = Your Supabase anon key

---

## Step 5: Deploy Your App

### On Vercel:
1. Push code to GitHub
2. Import project to Vercel
3. Add environment variables (Step 4)
4. Deploy!

### On Railway:
1. Push code to GitHub
2. Import project to Railway
3. Add environment variables (Step 4)
4. Deploy!

### On Any Platform:
- Works on **any platform** that supports Node.js
- No special configuration needed
- Just add environment variables

---

## Step 6: Test Your App

1. Open your deployed app
2. Try adding a phone
3. Check Supabase dashboard → **Table Editor** → **phones**
4. You should see your data! ✅

---

## What Changed?

✅ **Removed**: SQLite (better-sqlite3)  
✅ **Added**: Supabase (PostgreSQL)  
✅ **Same API**: Frontend code unchanged  
✅ **Same features**: Everything works the same  

---

## Troubleshooting

### "Supabase credentials not found"
- Make sure you set `SUPABASE_URL` and `SUPABASE_ANON_KEY` environment variables

### "Table doesn't exist"
- Run the SQL schema in Supabase SQL Editor (Step 2)

### "Permission denied"
- Check Row Level Security policies in Supabase
- The default policy allows all operations

---

## Next Steps

1. ✅ Create Supabase account
2. ✅ Run SQL schema
3. ✅ Get API keys
4. ✅ Set environment variables
5. ✅ Deploy and test!

---

**That's it!** Your app now uses a cloud database like your other webapps! 🚀

