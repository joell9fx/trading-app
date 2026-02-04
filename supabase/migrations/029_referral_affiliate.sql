-- Referral & Affiliate system additions
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS referred_by TEXT REFERENCES profiles(referral_code);

CREATE TABLE IF NOT EXISTS referrals (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  referrer_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referred_user_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT,
  status TEXT DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  reward_given BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

