#!/usr/bin/env node

console.log('🚨 URGENT: Database Setup Required');
console.log('===================================\n');

console.log('❌ You are getting a 500 error because the database is not set up!');
console.log('✅ Follow these steps to fix it immediately:\n');

console.log('1️⃣  Open this URL in your browser:');
console.log('   https://supabase.com/dashboard/project/cfnfrxnxnavlknrjujurj/sql/new\n');

console.log('2️⃣  Copy and paste this EXACT SQL into the editor:\n');

console.log('='.repeat(80));
console.log(`
-- CRITICAL: Fix for "Database error saving new user"
-- Copy and paste this EXACTLY as shown

-- Create the profiles table
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

-- Create the user registration function
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

-- Create the trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;

-- Success message
SELECT 'Database fixed! User registration will now work.' as status;
`);
console.log('='.repeat(80));

console.log('\n3️⃣  Click the "Run" button\n');

console.log('4️⃣  You should see: "Database fixed! User registration will now work."\n');

console.log('5️⃣  Go back to your app and try signing up again!\n');

console.log('🔗 Direct link to SQL Editor:');
console.log('   https://supabase.com/dashboard/project/cfnfrxnxnavlknrjujurj/sql/new\n');

console.log('⚠️  IMPORTANT: This fixes the 500 error you are seeing.');
console.log('   The signup will work immediately after running this SQL.\n');

console.log('🎯 This creates the essential database structure for user registration.');
console.log('   Run this now and your app will work!');
