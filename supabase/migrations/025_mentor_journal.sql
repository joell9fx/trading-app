-- Weekly mentor journal entries
CREATE TABLE IF NOT EXISTS mentor_journal (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    week_start DATE,
    week_end DATE,
    summary TEXT,
    emotions TEXT,
    strengths TEXT,
    weaknesses TEXT,
    next_focus TEXT,
    xp_awarded INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User reflections per journal entry
CREATE TABLE IF NOT EXISTS user_reflections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    journal_id UUID REFERENCES mentor_journal(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reflection TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_journal_user_id ON mentor_journal(user_id);
CREATE INDEX IF NOT EXISTS idx_user_reflections_journal_id ON user_reflections(journal_id);

