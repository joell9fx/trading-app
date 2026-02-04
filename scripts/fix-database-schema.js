const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

async function fixDatabaseSchema() {
  console.log('🔧 Fixing Database Schema Issues');
  console.log('================================\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  try {
    console.log('🔍 Checking current database schema...');
    
    // Check if profiles table exists and has the right structure
    const { data: profilesCheck, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .limit(1);

    if (profilesError) {
      console.log('❌ Profiles table issue:', profilesError.message);
    } else {
      console.log('✅ Profiles table is accessible');
    }

    // Check community_channels table
    const { data: channelsCheck, error: channelsError } = await supabase
      .from('community_channels')
      .select('*')
      .limit(1);

    if (channelsError) {
      console.log('❌ Community channels table issue:', channelsError.message);
    } else {
      console.log('✅ Community channels table is accessible');
    }

    // Check community_posts table
    const { data: postsCheck, error: postsError } = await supabase
      .from('community_posts')
      .select('*')
      .limit(1);

    if (postsError) {
      console.log('❌ Community posts table issue:', postsError.message);
    } else {
      console.log('✅ Community posts table is accessible');
    }

    console.log('\n📋 The database schema needs to be updated to fix the API errors.');
    console.log('Please run this SQL in your Supabase SQL Editor:');
    
    const fixSQL = `
-- FIX DATABASE SCHEMA FOR COMMUNITY POSTS
-- This will resolve the API errors you're seeing

-- Step 1: Drop existing tables to recreate them properly
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS community_channels CASCADE;

-- Step 2: Create community_channels table with correct structure
CREATE TABLE community_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 3: Create community_posts table with correct foreign key relationships
CREATE TABLE community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    channel_id UUID REFERENCES community_channels(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Step 4: Create indexes for performance
CREATE INDEX idx_community_posts_channel_id ON community_posts(channel_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);
CREATE INDEX idx_community_channels_name ON community_channels(name);

-- Step 5: Enable Row Level Security
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Step 6: Create RLS policies for community_channels
DROP POLICY IF EXISTS "Anyone can view public channels" ON community_channels;
CREATE POLICY "Anyone can view public channels" ON community_channels 
  FOR SELECT USING (is_public = true);

DROP POLICY IF EXISTS "Authenticated users can create channels" ON community_channels;
CREATE POLICY "Authenticated users can create channels" ON community_channels 
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Step 7: Create RLS policies for community_posts
DROP POLICY IF EXISTS "Anyone can view posts in public channels" ON community_posts;
CREATE POLICY "Anyone can view posts in public channels" ON community_posts 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM community_channels 
      WHERE community_channels.id = community_posts.channel_id 
      AND community_channels.is_public = true
    )
  );

DROP POLICY IF EXISTS "Users can insert posts" ON community_posts;
CREATE POLICY "Users can insert posts" ON community_posts 
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own posts" ON community_posts;
CREATE POLICY "Users can update their own posts" ON community_posts 
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON community_posts;
CREATE POLICY "Users can delete their own posts" ON community_posts 
  FOR DELETE USING (auth.uid() = user_id);

-- Step 8: Insert a default channel
INSERT INTO community_channels (name, description, is_public) 
VALUES ('General Discussion', 'General trading discussion and questions', true)
ON CONFLICT (name) DO NOTHING;

-- Step 9: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON community_channels TO anon, authenticated;
GRANT ALL ON community_posts TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 10: Verify the setup
SELECT '=== SCHEMA FIX COMPLETE ===' as status;
SELECT 'Tables created successfully' as message;
SELECT COUNT(*) as channels_count FROM community_channels;
SELECT COUNT(*) as posts_count FROM community_posts;
`;

    console.log('\n' + fixSQL + '\n');
    
    console.log('🔗 Go to: https://supabase.com/dashboard/project/cfnfrxnxnavlknrjujurj/sql/new');
    console.log('📋 Copy and paste the SQL above, then click "Run"');
    console.log('\n⚠️  This will drop and recreate the community tables with the correct schema.');
    console.log('    Any existing community data will be lost, but the API will work properly.');

  } catch (error) {
    console.error('❌ Error checking database schema:', error.message);
  }
}

// Run the fix
fixDatabaseSchema().then(() => {
  console.log('\n🎯 After running the SQL:');
  console.log('1. The API errors should be resolved');
  console.log('2. The community posts should load properly');
  console.log('3. You can test the functionality at /test');
});
