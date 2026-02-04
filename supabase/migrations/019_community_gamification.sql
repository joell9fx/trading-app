-- Community activity tracking
CREATE TABLE IF NOT EXISTS community_activity (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    action_type TEXT,
    xp_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Message engagement fields
ALTER TABLE messages ADD COLUMN IF NOT EXISTS reaction_count INTEGER DEFAULT 0;
ALTER TABLE messages ADD COLUMN IF NOT EXISTS is_trade_post BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_community_activity_user_action ON community_activity(user_id, action_type);
CREATE INDEX IF NOT EXISTS idx_messages_reaction_count ON messages(reaction_count);

