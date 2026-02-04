-- Mentor long-term memory
CREATE TABLE IF NOT EXISTS mentor_memory (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    memory_type TEXT,
    content TEXT,
    sentiment TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mentor_memory_user_id ON mentor_memory(user_id);
CREATE INDEX IF NOT EXISTS idx_mentor_memory_type ON mentor_memory(memory_type);

-- Sentiment on mentor chats
ALTER TABLE mentor_chats ADD COLUMN IF NOT EXISTS sentiment TEXT;

