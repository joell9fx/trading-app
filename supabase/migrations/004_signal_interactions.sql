-- Create signal_likes table
CREATE TABLE IF NOT EXISTS signal_likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    signal_id UUID REFERENCES signals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(signal_id, user_id)
);

-- Create signal_comments table
CREATE TABLE IF NOT EXISTS signal_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    signal_id UUID REFERENCES signals(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_signal_likes_signal_id ON signal_likes(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_likes_user_id ON signal_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_signal_comments_signal_id ON signal_comments(signal_id);
CREATE INDEX IF NOT EXISTS idx_signal_comments_user_id ON signal_comments(user_id);

-- Enable RLS
ALTER TABLE signal_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE signal_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for signal_likes
CREATE POLICY "Users can view all signal likes" ON signal_likes FOR SELECT USING (true);
CREATE POLICY "Users can create signal likes" ON signal_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own signal likes" ON signal_likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for signal_comments
CREATE POLICY "Users can view all signal comments" ON signal_comments FOR SELECT USING (true);
CREATE POLICY "Users can create signal comments" ON signal_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own signal comments" ON signal_comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own signal comments" ON signal_comments FOR DELETE USING (auth.uid() = user_id);

-- Add updated_at trigger for signal_comments
CREATE TRIGGER update_signal_comments_updated_at BEFORE UPDATE ON signal_comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

