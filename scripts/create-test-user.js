#!/usr/bin/env node

console.log('👤 Creating Test User in Supabase');
console.log('==================================\n');

console.log('📋 To create a test user, run this SQL in your Supabase SQL Editor:\n');

console.log('🔗 Go to: https://supabase.com/dashboard/project/cfnfrxnxnavlknrjujurj/sql/new\n');

console.log('📄 Copy and paste this SQL:\n');

console.log('='.repeat(80));
console.log(`
-- Create Test User in Supabase
-- This will create a test user that you can use to login

-- Generate a UUID for the test user
DO $$
DECLARE
    test_user_id UUID := gen_random_uuid();
BEGIN
    -- Insert into auth.users table
    INSERT INTO auth.users (
        id,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_user_meta_data,
        is_super_admin,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        test_user_id,
        'test@tradingacademy.com',
        crypt('password123', gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"name": "Test User"}'::jsonb,
        false,
        '',
        '',
        '',
        ''
    );

    -- Insert into profiles table (this should happen automatically via trigger, but we'll do it manually to be sure)
    INSERT INTO profiles (
        id,
        email,
        name,
        role,
        created_at,
        updated_at
    ) VALUES (
        test_user_id,
        'test@tradingacademy.com',
        'Test User',
        'MEMBER',
        NOW(),
        NOW()
    );

    -- Display the created user info
    RAISE NOTICE 'Test user created successfully!';
    RAISE NOTICE 'Email: test@tradingacademy.com';
    RAISE NOTICE 'Password: password123';
    RAISE NOTICE 'User ID: %', test_user_id;
END $$;

-- Verify the user was created
SELECT 
    u.id,
    u.email,
    u.created_at,
    p.name,
    p.role
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.id
WHERE u.email = 'test@tradingacademy.com';
`);
console.log('='.repeat(80));

console.log('\n✅ After running this SQL, you can login with:');
console.log('   📧 Email: test@tradingacademy.com');
console.log('   🔑 Password: password123\n');

console.log('🎯 This creates a test user that you can use to:');
console.log('   - Test the login functionality');
console.log('   - Access the dashboard');
console.log('   - Test all app features\n');

console.log('⚠️  Note: This is a test user only. In production, users would sign up normally.\n');

console.log('🚀 Run the SQL above and then try logging in with the test credentials!');
