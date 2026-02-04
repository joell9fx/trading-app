-- Showcase posts for social sharing
CREATE TABLE IF NOT EXISTS user_showcase_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT,
    title TEXT,
    caption TEXT,
    image_url TEXT,
    likes INT DEFAULT 0,
    comments_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showcase_comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES user_showcase_posts(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_showcase_posts_user_id ON user_showcase_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_showcase_comments_post_id ON showcase_comments(post_id);

