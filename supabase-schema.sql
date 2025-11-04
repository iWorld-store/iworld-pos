-- iWorld Store POS - Supabase Database Schema
-- Run this SQL in your Supabase SQL Editor to create the tables

-- Create phones table
CREATE TABLE IF NOT EXISTS phones (
  id BIGSERIAL PRIMARY KEY,
  imei1 TEXT NOT NULL,
  imei2 TEXT,
  model_name TEXT,
  storage TEXT,
  color TEXT,
  condition TEXT,
  unlock_status TEXT,
  purchase_date TIMESTAMPTZ NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  sale_date TIMESTAMPTZ,
  sale_price DECIMAL(10,2),
  status TEXT NOT NULL DEFAULT 'in_stock',
  vendor TEXT,
  customer_name TEXT,
  payment_method TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create returns table
CREATE TABLE IF NOT EXISTS returns (
  id BIGSERIAL PRIMARY KEY,
  phone_id BIGINT NOT NULL REFERENCES phones(id) ON DELETE CASCADE,
  return_date TIMESTAMPTZ NOT NULL,
  return_reason TEXT NOT NULL,
  refund_amount DECIMAL(10,2) NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_phones_imei1 ON phones(imei1);
CREATE INDEX IF NOT EXISTS idx_phones_imei2 ON phones(imei2);
CREATE INDEX IF NOT EXISTS idx_phones_status ON phones(status);
CREATE INDEX IF NOT EXISTS idx_returns_phone_id ON returns(phone_id);
CREATE INDEX IF NOT EXISTS idx_returns_return_date ON returns(return_date);

-- Enable Row Level Security (optional - for future authentication)
ALTER TABLE phones ENABLE ROW LEVEL SECURITY;
ALTER TABLE returns ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all operations (for now - can be restricted later)
CREATE POLICY "Allow all operations on phones" ON phones
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on returns" ON returns
  FOR ALL USING (true) WITH CHECK (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_phones_updated_at
  BEFORE UPDATE ON phones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

