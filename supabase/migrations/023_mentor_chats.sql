-- Mentor chat history
CREATE TABLE IF NOT EXISTS mentor_chats (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    message TEXT,
    role TEXT, -- 'user' or 'assistant'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_chats_user_id ON mentor_chats(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_chats_created_at ON mentor_chats(created_at);

