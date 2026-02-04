#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Database Status');
console.log('===========================\n');

console.log('❓ You\'re still getting "Database error saving new user"');
console.log('🔍 Let\'s check what might be wrong with the database setup.\n');

console.log('📋 **STEP 1: Check Database Tables**');
console.log('Go to: https://supabase.com/dashboard/project/cfnfrxnxnavlknrjujurj/sql/new');
console.log('Run this diagnostic query:\n');

const diagnosticSQL = `-- DIAGNOSTIC: Check what exists in your database
SELECT '=== DATABASE STATUS CHECK ===' as info;

-- Check if profiles table exists
SELECT 'Profiles table exists:' as check_item, 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') as result;

-- Check if handle_new_user function exists
SELECT 'handle_new_user function exists:' as check_item,
       EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'handle_new_user') as result;

-- Check if trigger exists
SELECT 'on_auth_user_created trigger exists:' as check_item,
       EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') as result;

-- Check RLS policies
SELECT 'RLS policies exist:' as check_item,
       EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles') as result;

-- Check permissions
SELECT 'Public schema permissions:' as check_item,
       EXISTS (SELECT FROM information_schema.role_table_grants 
               WHERE grantee = 'authenticated' AND table_name = 'profiles') as result;

-- Check if any profiles exist
SELECT 'Profiles count:' as check_item, COUNT(*) as result FROM profiles;

-- Check auth.users table structure
SELECT 'Auth users table exists:' as check_item,
       EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'auth' AND table_name = 'users') as result;`;

console.log(diagnosticSQL);
console.log('\n📋 **STEP 2: If Tables Are Missing**');
console.log('If any of the above return "false", run this complete setup:\n');

const setupSQL = `-- COMPLETE DATABASE SETUP
-- This will create everything needed for user registration

-- Step 1: Clean up everything (if it exists)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user() CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP POLICY IF EXISTS "Users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Step 2: Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Step 3: Create profiles table
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

-- Step 4: Create user registration function (with error handling)
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
EXCEPTION
    WHEN OTHERS THEN
        RAISE LOG 'Error in handle_new_user: %', SQLERRM;
        RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Create trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Step 6: Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Step 7: Create policies
CREATE POLICY "Users can view all profiles" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Step 8: Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON profiles TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- Step 9: Verify setup
SELECT '=== SETUP COMPLETE ===' as status;
SELECT 'Profiles table created successfully' as message;
SELECT COUNT(*) as profiles_count FROM profiles;`;

console.log(setupSQL);
console.log('\n📋 **STEP 3: Test the Setup**');
console.log('After running the setup, test it with this verification:\n');

const verifySQL = `-- VERIFICATION: Check everything is working
SELECT '=== VERIFICATION RESULTS ===' as info;

-- Check table
SELECT 'Profiles table exists:' as check_item, 
       EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'profiles') as result
UNION ALL
SELECT 'Function exists:' as check_item,
       EXISTS (SELECT FROM information_schema.routines WHERE routine_name = 'handle_new_user') as result
UNION ALL
SELECT 'Trigger exists:' as check_item,
       EXISTS (SELECT FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created') as result
UNION ALL
SELECT 'RLS enabled:' as check_item,
       EXISTS (SELECT FROM pg_tables WHERE tablename = 'profiles' AND rowsecurity = true) as result
UNION ALL
SELECT 'Policies exist:' as check_item,
       EXISTS (SELECT FROM pg_policies WHERE tablename = 'profiles') as result;`;

console.log(verifySQL);
console.log('\n🎯 **What to do:**');
console.log('1️⃣  Run the DIAGNOSTIC query first');
console.log('2️⃣  If anything returns "false", run the COMPLETE SETUP');
console.log('3️⃣  Run the VERIFICATION query to confirm');
console.log('4️⃣  Try signing up again in your app');
console.log('\n⚠️  The issue is likely that the database tables weren\'t created properly.');
console.log('   This SQL will fix it completely!');

