-- Referral codes on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS referral_code TEXT;
UPDATE profiles SET referral_code = LEFT(id::text, 8) WHERE referral_code IS NULL;
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);

-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reward_status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Referral rewards table
CREATE TABLE IF NOT EXISTS referral_rewards (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reward_type TEXT,
    amount NUMERIC DEFAULT 0,
    is_redeemed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referral_rewards_user_id ON referral_rewards(user_id);

