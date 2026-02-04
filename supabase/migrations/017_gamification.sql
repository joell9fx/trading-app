-- XP, rank, badges on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS xp INTEGER DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS rank_position INTEGER;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS badges TEXT[] DEFAULT '{}';

-- Leaderboard snapshots
CREATE TABLE IF NOT EXISTS leaderboard_snapshots (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    xp INTEGER,
    rank INTEGER,
    snapshot_date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Function to increment XP and notify
CREATE OR REPLACE FUNCTION increment_xp(user_id UUID, amount INT, reason TEXT)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles SET xp = COALESCE(xp,0) + amount WHERE id = user_id;
  INSERT INTO notifications (user_id, type, title, message)
  VALUES (user_id, 'xp', '⭐ XP Earned', CONCAT('You earned ', amount, ' XP for ', reason, '.'));
END;
$$ LANGUAGE plpgsql;

