-- User services unlocks
CREATE TABLE IF NOT EXISTS user_services (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    service_key TEXT NOT NULL,
    is_unlocked BOOLEAN DEFAULT FALSE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE (user_id, service_key)
);

-- Transactions for purchases
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    service_key TEXT NOT NULL,
    payment_status TEXT,
    amount NUMERIC,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_services_user_id ON user_services(user_id);
CREATE INDEX IF NOT EXISTS idx_user_services_service_key ON user_services(service_key);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_service_key ON transactions(service_key);

-- Enable RLS
ALTER TABLE user_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Policies for user_services
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Users can view own services') THEN
    CREATE POLICY "Users can view own services" ON user_services
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Users can upsert own services') THEN
    CREATE POLICY "Users can upsert own services" ON user_services
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Admins can manage all services') THEN
    CREATE POLICY "Admins can manage all services" ON user_services
      FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
  END IF;
END $$;

-- Policies for transactions
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Users can view own transactions') THEN
    CREATE POLICY "Users can view own transactions" ON transactions
      FOR SELECT USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE polname = 'Admins can manage all transactions') THEN
    CREATE POLICY "Admins can manage all transactions" ON transactions
      FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'))
      WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN'));
  END IF;
END $$;

