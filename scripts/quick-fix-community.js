const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

async function quickFixCommunity() {
  console.log('🔧 Quick Fix for Community Posts API');
  console.log('=====================================\n');

  console.log('📋 The issue is with the database schema. Here are TWO options to fix it:');
  console.log('\n🚀 OPTION 1: Quick Fix (Recommended)');
  console.log('Run this SQL in Supabase to fix the existing tables:');
  
  const quickFixSQL = `
-- QUICK FIX: Update existing tables without dropping them
-- This preserves any existing data

-- Fix 1: Add missing column to community_channels
ALTER TABLE community_channels 
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT true;

-- Fix 2: Update any existing records to have is_public = true
UPDATE community_channels 
SET is_public = true 
WHERE is_public IS NULL;

-- Fix 3: Create the missing foreign key relationship
-- First, check if the constraint exists
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'community_posts_user_id_fkey'
    ) THEN
        -- Add the foreign key constraint
        ALTER TABLE community_posts 
        ADD CONSTRAINT community_posts_user_id_fkey 
        FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Fix 4: Update the API query to use the correct column names
-- The API is looking for 'profiles' but should use 'auth.users' directly

-- Fix 5: Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON community_channels TO anon, authenticated;
GRANT ALL ON community_posts TO anon, authenticated;

-- Verify the fix
SELECT '=== QUICK FIX APPLIED ===' as status;
SELECT 'Tables updated successfully' as message;
SELECT COUNT(*) as channels_count FROM community_channels;
SELECT COUNT(*) as posts_count FROM community_posts;
`;

  console.log('\n' + quickFixSQL + '\n');
  
  console.log('🚀 OPTION 2: Complete Reset (If Option 1 doesn\'t work)');
  console.log('Run this SQL to completely recreate the tables:');
  
  const completeResetSQL = `
-- COMPLETE RESET: Drop and recreate tables
-- WARNING: This will delete all existing community data

-- Drop existing tables
DROP TABLE IF EXISTS community_posts CASCADE;
DROP TABLE IF EXISTS community_channels CASCADE;

-- Recreate community_channels
CREATE TABLE community_channels (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Recreate community_posts with correct structure
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

-- Create indexes
CREATE INDEX idx_community_posts_channel_id ON community_posts(channel_id);
CREATE INDEX idx_community_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON community_posts(created_at);

-- Enable RLS
ALTER TABLE community_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
CREATE POLICY "Anyone can view public channels" ON community_channels FOR SELECT USING (true);
CREATE POLICY "Anyone can view posts" ON community_posts FOR SELECT USING (true);
CREATE POLICY "Users can insert posts" ON community_posts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Insert default channel
INSERT INTO community_channels (name, description, is_public) 
VALUES ('General Discussion', 'General trading discussion and questions', true);

-- Grant permissions
GRANT ALL ON community_channels TO anon, authenticated;
GRANT ALL ON community_posts TO anon, authenticated;

-- Verify
SELECT '=== COMPLETE RESET APPLIED ===' as status;
SELECT COUNT(*) as channels_count FROM community_channels;
SELECT COUNT(*) as posts_count FROM community_posts;
`;

  console.log('\n' + completeResetSQL + '\n');
  
  console.log('🔗 Go to: https://supabase.com/dashboard/project/cfnfrxnxnavlknrjujurj/sql/new');
  console.log('📋 Try OPTION 1 first (Quick Fix)');
  console.log('🔄 If that doesn\'t work, try OPTION 2 (Complete Reset)');
  
  console.log('\n🎯 After running either SQL:');
  console.log('1. Go back to http://localhost:3000/test');
  console.log('2. Click "Test Community Posts API"');
  console.log('3. You should see "✅ Community posts API working!"');
}

// Run the quick fix
quickFixCommunity().then(() => {
  console.log('\n💡 TIP: Start with OPTION 1 (Quick Fix) as it preserves your data.');
  console.log('   Only use OPTION 2 if OPTION 1 doesn\'t resolve the issue.');
});
