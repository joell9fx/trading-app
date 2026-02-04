-- Add membership tier to profiles (users)
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS membership_tier TEXT DEFAULT 'Standard';

-- History table for tier changes
CREATE TABLE IF NOT EXISTS membership_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    previous_tier TEXT,
    new_tier TEXT,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_membership_history_user_id ON membership_history(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_membership_tier ON profiles(membership_tier);

