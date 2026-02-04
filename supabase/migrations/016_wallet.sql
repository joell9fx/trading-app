-- Extend referral_rewards for wallet tracking
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS transaction_type TEXT DEFAULT 'earn';
ALTER TABLE referral_rewards ADD COLUMN IF NOT EXISTS description TEXT;

-- Default existing rows to earn
UPDATE referral_rewards SET transaction_type = 'earn' WHERE transaction_type IS NULL;

-- Wallet balance view
CREATE OR REPLACE VIEW user_wallet_balance AS
SELECT
  user_id,
  COALESCE(SUM(CASE WHEN is_redeemed = FALSE AND reward_type = 'credit' THEN amount ELSE 0 END), 0) AS available_credits,
  COALESCE(SUM(amount), 0) AS total_earned
FROM referral_rewards
GROUP BY user_id;

CREATE INDEX IF NOT EXISTS idx_user_wallet_balance_user_id ON user_wallet_balance(user_id);

