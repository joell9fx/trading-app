#!/usr/bin/env node

console.log('🔍 Database Verification & Fix');
console.log('==============================\n');

console.log('❌ You are still getting "Database error saving new user"');
console.log('✅ This means the database setup is not complete.\n');

console.log('📋 STEP-BY-STEP SOLUTION:\n');

console.log('1️⃣  Go to Supabase Dashboard:');
console.log('   https://supabase.com/dashboard\n');

console.log('2️⃣  Select your project: cfnfrxnxnavlknrjujurj\n');

console.log('3️⃣  Go to SQL Editor (left sidebar)\n');

console.log('4️⃣  Click "New Query"\n');

console.log('5️⃣  First, let\'s check if the profiles table exists. Run this:\n');

console.log('='.repeat(80));
console.log(`
-- Check if profiles table exists
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
) as table_exists;
`);
console.log('='.repeat(80));

console.log('\n6️⃣  If it returns "false", then run this COMPLETE setup:\n');

console.log('='.repeat(80));
console.log(`
-- COMPLETE DATABASE SETUP
-- This will create everything needed for user registration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing objects to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

-- Create profiles table
CREATE TABLE profiles (
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

-- Create user registration function
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

-- Create trigger for new users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Create policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;

-- Verify setup
SELECT 'Database setup completed successfully!' as status;
SELECT COUNT(*) as profiles_count FROM profiles;
`);
console.log('='.repeat(80));

console.log('\n7️⃣  After running the setup, verify it worked:\n');

console.log('='.repeat(80));
console.log(`
-- Verify the setup worked
SELECT 'Profiles table exists:' as check_item, 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') as result
UNION ALL
SELECT 'handle_new_user function exists:' as check_item,
       EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'handle_new_user') as result
UNION ALL
SELECT 'on_auth_user_created trigger exists:' as check_item,
       EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') as result;
`);
console.log('='.repeat(80));

console.log('\n8️⃣  If all checks return "true", your database is ready!\n');

console.log('🔗 Direct link to SQL Editor:');
console.log('   https://supabase.com/dashboard/project/cfnfrxnxnavlknrjujurj/sql/new\n');

console.log('⚠️  IMPORTANT:');
console.log('   - Run the checks first to see what\'s missing');
console.log('   - Then run the complete setup if needed');
console.log('   - Finally verify everything is working\n');

console.log('🎯 This will definitely fix your "Database error saving new user" issue.');
console.log('   Follow the steps exactly and your signup will work!');
