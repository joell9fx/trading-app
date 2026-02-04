-- Create funding_accounts table
CREATE TABLE IF NOT EXISTS funding_accounts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    prop_firm_name TEXT NOT NULL,
    account_type TEXT NOT NULL CHECK (account_type IN ('evaluation', 'funded')),
    challenge_type TEXT CHECK (challenge_type IN ('phase1', 'phase2', 'combined')),
    account_size DECIMAL(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'approved')),
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    current_balance DECIMAL(10, 2),
    profit_target DECIMAL(10, 2),
    max_drawdown DECIMAL(10, 2),
    daily_loss_limit DECIMAL(10, 2),
    myfxbook_url TEXT,
    api_key TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create funding_account_updates table for tracking progress
CREATE TABLE IF NOT EXISTS funding_account_updates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    funding_account_id UUID REFERENCES funding_accounts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    update_type TEXT NOT NULL CHECK (update_type IN ('balance', 'trade', 'milestone', 'note')),
    balance DECIMAL(10, 2),
    profit_loss DECIMAL(10, 2),
    drawdown DECIMAL(10, 2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_funding_accounts_user_id ON funding_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_funding_accounts_status ON funding_accounts(status);
CREATE INDEX IF NOT EXISTS idx_funding_account_updates_funding_account_id ON funding_account_updates(funding_account_id);
CREATE INDEX IF NOT EXISTS idx_funding_account_updates_user_id ON funding_account_updates(user_id);

-- Enable RLS
ALTER TABLE funding_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE funding_account_updates ENABLE ROW LEVEL SECURITY;

-- RLS Policies for funding_accounts
CREATE POLICY "Users can view own funding accounts" ON funding_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all funding accounts" ON funding_accounts FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Users can create own funding accounts" ON funding_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own funding accounts" ON funding_accounts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can update all funding accounts" ON funding_accounts FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- RLS Policies for funding_account_updates
CREATE POLICY "Users can view own funding account updates" ON funding_account_updates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all funding account updates" ON funding_account_updates FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Users can create own funding account updates" ON funding_account_updates FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can create funding account updates" ON funding_account_updates FOR INSERT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- Add updated_at trigger
CREATE TRIGGER update_funding_accounts_updated_at BEFORE UPDATE ON funding_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

