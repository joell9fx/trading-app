-- Affiliate tiers and payouts
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS affiliate_tier TEXT DEFAULT 'Bronze';

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS affiliate_total_commission NUMERIC DEFAULT 0;

CREATE TABLE IF NOT EXISTS affiliate_tiers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text UNIQUE,
  min_referrals int,
  commission_rate numeric,
  xp_bonus int,
  color text
);

CREATE TABLE IF NOT EXISTS affiliate_payouts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  affiliate_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  referral_id uuid REFERENCES referrals(id) ON DELETE SET NULL,
  amount numeric,
  status text DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  paid_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_affiliate ON affiliate_payouts(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_payouts_status ON affiliate_payouts(status);

-- Seed tiers
INSERT INTO affiliate_tiers (name, min_referrals, commission_rate, xp_bonus, color)
VALUES
('Bronze', 0, 0.05, 10, '#b08d57'),
('Silver', 10, 0.10, 25, '#C0C0C0'),
('Gold', 25, 0.15, 50, '#FFD700'),
('Platinum', 50, 0.20, 100, '#E5E4E2'),
('Elite', 100, 0.25, 150, '#F5D142')
ON CONFLICT (name) DO NOTHING;

