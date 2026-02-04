#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🔧 Creating .env.local File');
console.log('===========================\n');

console.log('❌ The .env.local file is missing! This is causing your database error.');
console.log('✅ Let\'s create it with the correct Supabase credentials.\n');

const envContent = `# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://cffqnrxnavlknrijuurj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZnFucnhuYXZsa25yaWp1dXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTMzMTEsImV4cCI6MjA3MDIyOTMxMX0.tvaJaKeTYd_urRpzU7qnEloo01Ty0oBImzWumK53p0w
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZnFucnhuYXZsa25yaWp1dXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY1MzMxMSwiZXhwIjoyMDcwMjI5MzExfQ.5GG6hK3vr8xWwemjPBeE3sA1KV0aKMgLLZDHoXqloIY

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-nextauth-secret-key-here

# Database Configuration
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.cfnfrxnxnavlknrjujurj.supabase.co:5432/postgres`;

const envPath = path.join(__dirname, '..', '.env.local');

try {
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local file created successfully!\n');
    
    console.log('📄 File contents:');
    console.log('='.repeat(80));
    console.log(envContent);
    console.log('='.repeat(80));
    
    console.log('\n🎯 Now restart your development server:');
    console.log('   1. Stop the current server (Ctrl+C)');
    console.log('   2. Run: npm run dev');
    console.log('   3. Try signing up again\n');
    
    console.log('⚠️  The database error should now be resolved!');
    console.log('   The missing .env.local file was preventing Supabase from connecting properly.');
    
} catch (error) {
    console.log('❌ Could not create .env.local file automatically.');
    console.log('📋 Please create it manually:\n');
    
    console.log('1️⃣  Create a file named .env.local in your project root');
    console.log('2️⃣  Copy and paste this content:\n');
    
    console.log('='.repeat(80));
    console.log(envContent);
    console.log('='.repeat(80));
    
    console.log('\n3️⃣  Save the file and restart your development server');
    console.log('4️⃣  Try signing up again');
}
