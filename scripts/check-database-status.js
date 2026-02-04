#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔍 Checking Database Status');
console.log('============================\n');

console.log('📋 To fix the "Database error saving new user" issue:\n');

console.log('1️⃣  Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard\n');

console.log('2️⃣  Select your project: cfnfrxnxnavlknrjujurj\n');

console.log('3️⃣  Go to SQL Editor (left sidebar)\n');

console.log('4️⃣  Click "New Query"\n');

console.log('5️⃣  Copy and paste this MINIMAL SQL below:\n');

console.log('='.repeat(80));
console.log(`
-- Minimal Database Setup for Trading Academy
-- This will create just the essential tables needed for user registration

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table (essential for user registration)
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
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create basic RLS policies
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
SELECT 'Minimal database setup completed! User registration should now work.' as status;
`);
console.log('='.repeat(80));

console.log('\n6️⃣  Click "Run" to execute the SQL\n');

console.log('7️⃣  You should see: "Minimal database setup completed!"\n');

console.log('✅ After this setup, try creating a new account again!\n');

console.log('🔗 Your Supabase Project URL: https://cffqnrxnavlknrijuurj.supabase.co');
console.log('🔑 Your credentials are already in .env.local\n');

console.log('🎯 This minimal setup creates only the essential tables needed for user registration.');
console.log('   You can run the full setup later for all features.\n');

console.log('🚀 Try the user registration again after running this SQL!');
