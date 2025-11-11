-- Supabase Database Schema for iPhone POS System
-- Run this SQL in Supabase SQL Editor

-- Enable UUID extension (for user authentication)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Phones Table (Inventory)
CREATE TABLE IF NOT EXISTS phones (
  id BIGSERIAL PRIMARY KEY,
  imei1 TEXT NOT NULL,
  imei2 TEXT,
  model_name TEXT NOT NULL,
  storage TEXT NOT NULL,
  color TEXT NOT NULL,
  condition TEXT NOT NULL CHECK (condition IN ('Boxpack', '10/10', 'Average')),
  unlock_status TEXT NOT NULL CHECK (unlock_status IN ('JV', 'Factory Unlocked', 'PTA')),
  battery_health TEXT,
  purchase_date TEXT NOT NULL,
  purchase_price DECIMAL(10, 2) NOT NULL,
  sale_date TEXT,
  sale_price DECIMAL(10, 2),
  receipt_number TEXT,
  status TEXT NOT NULL DEFAULT 'in_stock' CHECK (status IN ('in_stock', 'sold')),
  vendor TEXT,
  customer_name TEXT,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Other')),
  is_credit BOOLEAN DEFAULT FALSE,
  credit_received DECIMAL(10, 2),
  credit_remaining DECIMAL(10, 2),
  notes TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Sales Table (created without original_return_id foreign key first)
CREATE TABLE IF NOT EXISTS sales (
  id BIGSERIAL PRIMARY KEY,
  phone_id BIGINT NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  sale_price DECIMAL(10, 2) NOT NULL,
  sale_date TEXT NOT NULL,
  customer_name TEXT,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Other')),
  profit DECIMAL(10, 2) NOT NULL,
  receipt_number TEXT NOT NULL,
  is_credit BOOLEAN DEFAULT FALSE,
  credit_received DECIMAL(10, 2),
  credit_remaining DECIMAL(10, 2),
  is_resale BOOLEAN DEFAULT FALSE,
  original_return_id BIGINT, -- Will add foreign key constraint after returns table is created
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Returns Table
CREATE TABLE IF NOT EXISTS returns (
  id BIGSERIAL PRIMARY KEY,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  phone_id BIGINT NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  return_type TEXT DEFAULT 'refund' CHECK (return_type IN ('refund', 'trade_in', 'exchange')),
  return_price DECIMAL(10, 2) NOT NULL,
  new_price DECIMAL(10, 2) NOT NULL,
  return_reason TEXT,
  return_date TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add foreign key constraint for original_return_id in sales table (after returns table exists)
ALTER TABLE sales 
  ADD CONSTRAINT sales_original_return_id_fkey 
  FOREIGN KEY (original_return_id) 
  REFERENCES returns(id) 
  ON DELETE SET NULL;

-- Migration: Update existing returns table to support return_type
-- Run this if the table already exists:
-- ALTER TABLE returns ADD COLUMN IF NOT EXISTS return_type TEXT DEFAULT 'refund';
-- ALTER TABLE returns DROP CONSTRAINT IF EXISTS returns_return_type_check;
-- ALTER TABLE returns ADD CONSTRAINT returns_return_type_check CHECK (return_type IN ('refund', 'trade_in', 'exchange'));

-- Migration: Update existing sales table to support resale tracking
-- Run this if the table already exists:
-- ALTER TABLE sales ADD COLUMN IF NOT EXISTS is_resale BOOLEAN DEFAULT FALSE;
-- ALTER TABLE sales ADD COLUMN IF NOT EXISTS original_return_id BIGINT REFERENCES returns(id) ON DELETE SET NULL;

-- 4. Credits Table
CREATE TABLE IF NOT EXISTS credits (
  id BIGSERIAL PRIMARY KEY,
  phone_id BIGINT NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  sale_id BIGINT NOT NULL REFERENCES sales(id) ON DELETE CASCADE,
  customer_name TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  received_amount DECIMAL(10, 2) NOT NULL,
  remaining_amount DECIMAL(10, 2) NOT NULL,
  sale_date TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Other')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'cancelled')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: Update existing credits table to support 'cancelled' status
-- Run this if the table already exists:
-- ALTER TABLE credits DROP CONSTRAINT IF EXISTS credits_status_check;
-- ALTER TABLE credits ADD CONSTRAINT credits_status_check CHECK (status IN ('pending', 'paid', 'cancelled'));

-- 5. Credit Payments Table
CREATE TABLE IF NOT EXISTS credit_payments (
  id BIGSERIAL PRIMARY KEY,
  credit_id BIGINT NOT NULL REFERENCES credits(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_date TEXT NOT NULL,
  payment_method TEXT CHECK (payment_method IN ('Cash', 'Card', 'Bank Transfer', 'Other')),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Migration: Add credit_payments table if it doesn't exist
-- This table is new, so no migration needed for existing databases

-- Create Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phones_user_id ON phones(user_id);
CREATE INDEX IF NOT EXISTS idx_phones_status ON phones(status);
CREATE INDEX IF NOT EXISTS idx_phones_imei1 ON phones(imei1);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_phone_id ON sales(phone_id);
CREATE INDEX IF NOT EXISTS idx_returns_user_id ON returns(user_id);
CREATE INDEX IF NOT EXISTS idx_credits_user_id ON credits(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_user_id ON credit_payments(user_id);
CREATE INDEX IF NOT EXISTS idx_credit_payments_credit_id ON credit_payments(credit_id);
CREATE INDEX IF NOT EXISTS idx_credits_status ON credits(status);

-- Enable Row Level Security (RLS)
ALTER TABLE phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Users can only see their own data)
-- Phones
CREATE POLICY "Users can view their own phones" ON phones
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own phones" ON phones
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own phones" ON phones
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own phones" ON phones
  FOR DELETE USING (auth.uid() = user_id);

-- Sales
CREATE POLICY "Users can view their own sales" ON sales
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales" ON sales
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales" ON sales
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales" ON sales
  FOR DELETE USING (auth.uid() = user_id);

-- Returns
CREATE POLICY "Users can view their own returns" ON returns
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own returns" ON returns
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own returns" ON returns
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own returns" ON returns
  FOR DELETE USING (auth.uid() = user_id);

-- Credits
CREATE POLICY "Users can view their own credits" ON credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credits" ON credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credits" ON credits
  FOR DELETE USING (auth.uid() = user_id);

-- Credit Payments
CREATE POLICY "Users can view their own credit payments" ON credit_payments
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credit payments" ON credit_payments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own credit payments" ON credit_payments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own credit payments" ON credit_payments
  FOR DELETE USING (auth.uid() = user_id);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_phones_updated_at BEFORE UPDATE ON phones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_credits_updated_at BEFORE UPDATE ON credits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

