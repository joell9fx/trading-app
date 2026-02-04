-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (consolidated structure)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    full_name TEXT, -- Keep both for compatibility
    bio TEXT,
    timezone TEXT,
    website TEXT,
    location TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'MEMBER' CHECK (role IN ('ADMIN', 'MEMBER')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create plans table
CREATE TABLE plans (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price_monthly INTEGER NOT NULL,
    price_yearly INTEGER NOT NULL,
    features JSONB NOT NULL DEFAULT '{}',
    stripe_monthly_price_id TEXT,
    stripe_yearly_price_id TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    plan_id UUID REFERENCES plans(id) ON DELETE CASCADE NOT NULL,
    status TEXT NOT NULL,
    current_period_start TIMESTAMP WITH TIME ZONE NOT NULL,
    current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
    cancel_at_period_end BOOLEAN DEFAULT false,
    stripe_subscription_id TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create courses table (consolidated structure)
CREATE TABLE courses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    slug TEXT UNIQUE NOT NULL,
    thumbnail_url TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    difficulty TEXT NOT NULL DEFAULT 'beginner' CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    rating DECIMAL(3, 2),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create lessons table
CREATE TABLE lessons (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    content TEXT,
    video_url TEXT,
    duration_minutes INTEGER NOT NULL DEFAULT 0,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create progress table
CREATE TABLE progress (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
    completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, lesson_id)
);

-- Create certificates table
CREATE TABLE certificates (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    verification_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mentors table (consolidated structure)
CREATE TABLE mentors (
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
CREATE TABLE bookings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    mentor_id UUID REFERENCES mentors(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
    notes TEXT,
    stripe_payment_intent_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_channels table
CREATE TABLE community_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_private BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create community_posts table (primary community posts)
CREATE TABLE community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES community_channels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create posts table for community feed (alternative naming)
CREATE TABLE posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    tag TEXT,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create comments table
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create likes table for posts
CREATE TABLE likes (
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
CREATE TABLE messages (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    channel TEXT NOT NULL DEFAULT 'global',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create events table for community events
CREATE TABLE events (
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

-- Create audit_log table for tracking sensitive actions
CREATE TABLE audit_log (
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
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_courses_slug ON courses(slug);
CREATE INDEX idx_courses_is_published ON courses(is_published);
CREATE INDEX idx_lessons_course_id ON lessons(course_id);
CREATE INDEX idx_lessons_order_index ON lessons(course_id, order_index);
CREATE INDEX idx_progress_user_id ON progress(user_id);
CREATE INDEX idx_progress_lesson_id ON progress(lesson_id);
CREATE INDEX idx_certificates_user_id ON certificates(user_id);
CREATE INDEX idx_certificates_verification_token ON certificates(verification_token);
CREATE INDEX idx_mentors_user_id ON mentors(user_id);
CREATE INDEX idx_bookings_mentor_id ON bookings(mentor_id);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_start_time ON bookings(start_time);
CREATE INDEX idx_community_posts_channel_id ON community_posts(channel_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_posts_user_id ON posts(user_id);
CREATE INDEX idx_posts_created_at ON posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_likes_post_id ON likes(post_id);
CREATE INDEX idx_likes_user_id ON likes(user_id);
CREATE INDEX idx_signals_created_by ON signals(created_by);
CREATE INDEX idx_signals_status ON signals(status);
CREATE INDEX idx_messages_channel ON messages(channel);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_events_start_time ON events(start_time);
CREATE INDEX idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX idx_audit_log_created_at ON audit_log(created_at DESC);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_plans_updated_at BEFORE UPDATE ON plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_progress_updated_at BEFORE UPDATE ON progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_channels_updated_at BEFORE UPDATE ON community_channels FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_posts_updated_at BEFORE UPDATE ON posts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_signals_updated_at BEFORE UPDATE ON signals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user registration (consolidated)
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO profiles (id, email, name, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
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
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;
ALTER TABLE mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for plans (public read access)
CREATE POLICY "Anyone can view active plans" ON plans FOR SELECT USING (is_active = true);

-- RLS Policies for subscriptions
CREATE POLICY "Users can view their own subscriptions" ON subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own subscriptions" ON subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own subscriptions" ON subscriptions FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for courses
CREATE POLICY "Anyone can view published courses" ON courses FOR SELECT USING (is_published = true);

-- RLS Policies for lessons
CREATE POLICY "Anyone can view lessons of published courses" ON lessons FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM courses 
        WHERE courses.id = lessons.course_id 
        AND courses.is_published = true
    )
);

-- RLS Policies for progress
CREATE POLICY "Users can view their own progress" ON progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON progress FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for certificates
CREATE POLICY "Users can view their own certificates" ON certificates FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view certificates by verification token" ON certificates FOR SELECT USING (true);

-- RLS Policies for mentors
CREATE POLICY "Anyone can view available mentors" ON mentors FOR SELECT USING (is_available = true);
CREATE POLICY "Mentors can update their own profile" ON mentors FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for bookings
CREATE POLICY "Users can view their own bookings" ON bookings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Mentors can view bookings for them" ON bookings FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM mentors 
        WHERE mentors.id = bookings.mentor_id 
        AND mentors.user_id = auth.uid()
    )
);
CREATE POLICY "Users can insert their own bookings" ON bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own bookings" ON bookings FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for community channels
CREATE POLICY "Anyone can view public channels" ON community_channels FOR SELECT USING (is_private = false);

-- RLS Policies for community posts
CREATE POLICY "Anyone can view posts in public channels" ON community_posts FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM community_channels 
        WHERE community_channels.id = community_posts.channel_id 
        AND community_channels.is_private = false
    )
);
CREATE POLICY "Users can insert posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own posts" ON community_posts FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for posts (community feed)
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

-- RLS Policies for audit_log (admin only)
CREATE POLICY "Only admins can view audit log" ON audit_log FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "System can insert audit log" ON audit_log FOR INSERT WITH CHECK (true);

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

-- Insert sample data
INSERT INTO plans (name, description, price_monthly, price_yearly, features) VALUES
('Starter', 'Perfect for beginners who want to learn the basics.', 0, 0, '["Access to 3 beginner courses", "Community forum access", "Basic trading tools", "Email support", "Mobile app access"]'),
('Pro', 'Everything you need to become a successful trader.', 4900, 49000, '["All Starter features", "Access to 50+ advanced courses", "1-on-1 mentoring sessions (2/month)", "Premium community access", "Real-time market alerts", "Advanced trading tools", "Priority support", "Certificate program", "Trading journal tools"]'),
('Enterprise', 'For teams and institutions requiring custom solutions.', 19900, 199000, '["All Pro features", "Unlimited mentoring sessions", "Custom course creation", "White-label solutions", "API access", "Dedicated account manager", "Custom integrations", "Team management tools", "Advanced analytics"]');

INSERT INTO community_channels (name, description, is_private) VALUES
('General Discussion', 'General trading discussions and questions', false),
('Technical Analysis', 'Technical analysis discussions and chart sharing', false),
('Fundamental Analysis', 'Fundamental analysis and market news', false),
('Risk Management', 'Risk management strategies and discussions', false),
('Success Stories', 'Share your trading success stories', false);

-- Insert sample profiles
INSERT INTO profiles (id, email, name, full_name, role, bio) VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@tradingacademy.com', 'Admin User', 'Admin User', 'ADMIN', 'System Administrator'),
    ('00000000-0000-0000-0000-000000000002', 'john@example.com', 'John Smith', 'John Smith', 'MEMBER', 'Forex trader with 5+ years experience'),
    ('00000000-0000-0000-0000-000000000003', 'maria@example.com', 'Maria Johnson', 'Maria Johnson', 'MEMBER', 'Crypto enthusiast and day trader')
ON CONFLICT (id) DO NOTHING;

-- Insert sample courses
INSERT INTO courses (title, description, slug, duration_minutes, difficulty, rating) VALUES
    ('Beginner Trading', 'Learn the basics of trading and market fundamentals', 'beginner-trading', 120, 'beginner', 4.8),
    ('Technical Analysis', 'Master chart patterns and technical indicators', 'technical-analysis', 240, 'intermediate', 4.9),
    ('Risk Management', 'Protect your capital with proper risk management', 'risk-management', 90, 'beginner', 4.7),
    ('Advanced Strategies', 'Advanced trading strategies for experienced traders', 'advanced-strategies', 180, 'advanced', 4.6)
ON CONFLICT (slug) DO NOTHING;

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

-- Insert sample posts (community feed)
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

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
