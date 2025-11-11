# Supabase Setup Guide - Step by Step

## ✅ Step 1: Create Supabase Project (You've Done This!)

Great! You've created your Supabase account and project.

---

## 📋 Step 2: Get Your API Keys

1. In your Supabase project dashboard
2. Go to **Settings** (gear icon) → **API**
3. You'll see:
   - **Project URL** (something like: `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

**Copy both of these - we'll need them in Step 4!**

---

## 🗄️ Step 3: Create Database Tables

1. In Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New query"**
3. Copy the entire contents of `supabase-schema.sql` file
4. Paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. Wait for success message ✅

**This creates:**
- 4 tables (phones, sales, returns, credits)
- Indexes for performance
- Row Level Security (RLS) policies
- Automatic timestamp updates

---

## 🔧 Step 4: Set Up Environment Variables

1. In your project root, create a file named `.env.local`
2. Add these lines (replace with YOUR values from Step 2):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Example:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI4MCwiZXhwIjoxOTU0NTQzMjgwfQ.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

3. Save the file

**⚠️ Important:** 
- Never commit `.env.local` to GitHub (it's already in `.gitignore`)
- For Vercel deployment, you'll add these as environment variables

---

## 👤 Step 5: Enable Email Authentication (Optional but Recommended)

1. In Supabase dashboard, go to **Authentication** → **Providers**
2. Make sure **Email** is enabled
3. (Optional) Configure email templates if needed

**For now, we'll keep the simple password login, but this allows future user registration.**

---

## ✅ Step 6: Verify Setup

1. Go to **Table Editor** in Supabase dashboard
2. You should see 4 tables:
   - ✅ phones
   - ✅ sales
   - ✅ returns
   - ✅ credits

If you see all 4 tables, you're ready! ✅

---

## 🚀 Next Steps

Once you've completed Steps 1-6, I'll help you:
1. Update the authentication system
2. Switch from IndexedDB to Supabase
3. Test everything

**Let me know when you've completed Steps 2-6, and I'll continue with the code updates!**

