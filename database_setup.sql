-- Trading Academy Community Platform Database Setup
-- Copy and paste this entire file into your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    bio TEXT,
    timezone TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table for community feed
CREATE TABLE IF NOT EXISTS posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tag TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table for posts
CREATE TABLE IF NOT EXISTS likes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(post_id, user_id)
);

-- Create signals table for trading signals
CREATE TABLE IF NOT EXISTS signals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    trading_pair TEXT NOT NULL,
    direction TEXT NOT NULL CHECK (direction IN ('long', 'short')),
    entry_price DECIMAL(20, 8) NOT NULL,
    stop_loss DECIMAL(20, 8) NOT NULL,
    take_profit DECIMAL(20, 8) NOT NULL,
    risk_reward_ratio DECIMAL(10, 4) NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create messages table for real-time chat
CREATE TABLE IF NOT EXISTS messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    channel TEXT NOT NULL DEFAULT 'global',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table for community events
CREATE TABLE IF NOT EXISTS events (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    type TEXT NOT NULL DEFAULT 'webinar' CHECK (type IN ('webinar', 'workshop', 'q&a')),
    created_by UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    duration_minutes INTEGER,
    difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    rating DECIMAL(3, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentors table
CREATE TABLE IF NOT EXISTS mentors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE NOT NULL,
    bio TEXT,
    expertise TEXT[],
    hourly_rate DECIMAL(10, 2),
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create bookings table for mentorship sessions
CREATE TABLE IF NOT EXISTS bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table for tracking sensitive actions
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    table_name TEXT,
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_user_id ON likes(user_id);
CREATE INDEX IF NOT EXISTS idx_signals_created_by ON signals(created_by);
CREATE INDEX IF NOT EXISTS idx_signals_status ON signals(status);
CREATE INDEX IF NOT EXISTS idx_messages_channel ON messages(channel);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);
CREATE INDEX IF NOT EXISTS idx_events_start_time ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_bookings_mentor_id ON bookings(mentor_id);
CREATE INDEX IF NOT EXISTS idx_bookings_user_id ON bookings(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        'MEMBER'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for posts
CREATE POLICY "Users can view all posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON posts FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for comments
CREATE POLICY "Users can view all comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for likes
CREATE POLICY "Users can view all likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for signals
CREATE POLICY "Users can view all signals" ON signals FOR SELECT USING (true);
CREATE POLICY "Only admins can create signals" ON signals FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Only admins can update signals" ON signals FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Only admins can delete signals" ON signals FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- RLS Policies for messages
CREATE POLICY "Users can view all messages" ON messages FOR SELECT USING (true);
CREATE POLICY "Users can create messages" ON messages FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own messages" ON messages FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own messages" ON messages FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for events
CREATE POLICY "Users can view all events" ON events FOR SELECT USING (true);
CREATE POLICY "Only admins can create events" ON events FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Only admins can update events" ON events FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "Only admins can delete events" ON events FOR DELETE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- RLS Policies for courses
CREATE POLICY "Users can view all courses" ON courses FOR SELECT USING (true);
CREATE POLICY "Only admins can manage courses" ON courses FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);

-- RLS Policies for mentors
CREATE POLICY "Users can view all mentors" ON mentors FOR SELECT USING (true);
CREATE POLICY "Users can update own mentor profile" ON mentors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create own mentor profile" ON mentors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view own bookings" ON bookings FOR SELECT USING (
    auth.uid() = user_id OR 
    auth.uid() IN (SELECT user_id FROM mentors WHERE id = bookings.mentor_id)
);
CREATE POLICY "Users can create bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Mentors can update their bookings" ON bookings FOR UPDATE USING (
    auth.uid() IN (SELECT user_id FROM mentors WHERE id = bookings.mentor_id)
);

-- RLS Policies for audit_log (admin only)
CREATE POLICY "Only admins can view audit log" ON audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "System can insert audit log" ON audit_log FOR INSERT WITH CHECK (true);

-- Insert sample data
INSERT INTO profiles (id, email, name, role, bio) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@tradingacademy.com', 'Admin User', 'ADMIN', 'System Administrator'),
    ('00000000-0000-0000-0000-000000000002', 'john@example.com', 'John Smith', 'MEMBER', 'Forex trader with 5+ years experience'),
    ('00000000-0000-0000-0000-000000000003', 'maria@example.com', 'Maria Johnson', 'MEMBER', 'Crypto enthusiast and day trader')
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (title, description, duration_minutes, difficulty, rating) VALUES
    ('Beginner Trading', 'Learn the basics of trading and market fundamentals', 120, 'beginner', 4.8),
    ('Technical Analysis', 'Master chart patterns and technical indicators', 240, 'intermediate', 4.9),
    ('Risk Management', 'Protect your capital with proper risk management', 90, 'beginner', 4.7),
    ('Advanced Strategies', 'Advanced trading strategies for experienced traders', 180, 'advanced', 4.6)
ON CONFLICT DO NOTHING;

-- Insert sample events
INSERT INTO events (title, description, start_time, end_time, location, type, created_by) VALUES
    ('Weekly Market Analysis', 'Join us for our weekly market analysis and Q&A session', 
     NOW() + INTERVAL '2 days', NOW() + INTERVAL '2 days' + INTERVAL '1 hour', 'Zoom', 'webinar', '00000000-0000-0000-0000-000000000001'),
    ('Risk Management Workshop', 'Learn essential risk management techniques', 
     NOW() + INTERVAL '5 days', NOW() + INTERVAL '5 days' + INTERVAL '2 hours', 'Online', 'workshop', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert sample mentors
INSERT INTO mentors (user_id, bio, expertise, hourly_rate, is_available) VALUES
    ('00000000-0000-0000-0000-000000000002', 'Forex specialist with 5+ years of experience', ARRAY['Forex', 'Technical Analysis'], 150.00, true),
    ('00000000-0000-0000-0000-000000000003', 'Crypto expert and day trader', ARRAY['Cryptocurrency', 'Day Trading'], 200.00, true)
ON CONFLICT DO NOTHING;

-- Insert sample posts
INSERT INTO posts (title, body, tag, user_id) VALUES
    ('Welcome to Trading Academy!', 'Welcome everyone to our new trading community. Let''s share knowledge and grow together!', 'announcement', '00000000-0000-0000-0000-000000000001'),
    ('My Trading Journey', 'Started trading 2 years ago and finally seeing consistent profits. Key lesson: patience is everything.', 'experience', '00000000-0000-0000-0000-000000000002'),
    ('Risk Management Tips', 'Always risk only 1-2% of your capital per trade. This has saved me countless times.', 'strategy', '00000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- Insert sample signals
INSERT INTO signals (trading_pair, direction, entry_price, stop_loss, take_profit, risk_reward_ratio, notes, created_by) VALUES
    ('BTC/USD', 'long', 45000.00, 44000.00, 47000.00, 2.0, 'Strong support at 44k, targeting resistance at 47k', '00000000-0000-0000-0000-000000000001'),
    ('EUR/USD', 'short', 1.0850, 1.0900, 1.0750, 1.5, 'Bearish divergence on RSI, targeting support', '00000000-0000-0000-0000-000000000001')
ON CONFLICT DO NOTHING;

-- Insert sample messages
INSERT INTO messages (content, user_id, channel) VALUES
    ('Welcome everyone to the Trading Academy chat!', '00000000-0000-0000-0000-000000000001', 'global'),
    ('Great to be here! Looking forward to learning from everyone.', '00000000-0000-0000-0000-000000000002', 'global'),
    ('Anyone trading crypto today?', '00000000-0000-0000-0000-000000000003', 'global')
ON CONFLICT DO NOTHING;

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, new_values)
        VALUES (auth.uid(), 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values, new_values)
        VALUES (auth.uid(), 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF TG_OP = 'DELETE' THEN
        INSERT INTO audit_log (user_id, action, table_name, record_id, old_values)
        VALUES (auth.uid(), 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create audit triggers for sensitive tables
CREATE TRIGGER audit_profiles AFTER INSERT OR UPDATE OR DELETE ON profiles FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_signals AFTER INSERT OR UPDATE OR DELETE ON signals FOR EACH ROW EXECUTE FUNCTION log_audit_event();
CREATE TRIGGER audit_events AFTER INSERT OR UPDATE OR DELETE ON events FOR EACH ROW EXECUTE FUNCTION log_audit_event();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Success message
SELECT 'Database setup completed successfully! All tables, policies, and sample data have been created.' as status;

