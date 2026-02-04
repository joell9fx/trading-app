-- Adaptive learning paths per user and pattern
CREATE TABLE IF NOT EXISTS learning_paths (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    pattern_type TEXT,
    title TEXT,
    description TEXT,
    difficulty TEXT,
    lesson_content TEXT,
    challenge_goal TEXT,
    resource_link TEXT,
    status TEXT DEFAULT 'active',
    progress INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_learning_paths_user_id ON learning_paths(user_id);

