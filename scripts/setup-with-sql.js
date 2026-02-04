#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Supabase credentials
const SUPABASE_URL = 'https://cffqnrxnavlknrijuurj.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZnFucnhuYXZsa25yaWp1dXJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDY1MzMxMSwiZXhwIjoyMDcwMjI5MzExfQ.5GG6hK3vr8xWwemjPBeE3sA1KV0aKMgLLZDHoXqloIY';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNmZnFucnhuYXZsa25yaWp1dXJqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ2NTMzMTEsImV4cCI6MjA3MDIyOTMxMX0.tvaJaKeTYd_urRpzU7qnEloo01Ty0oBImzWumK53p0w';

async function checkDatabaseStatus() {
  try {
    console.log('🔍 Checking database status...');
    
    // Check if profiles table exists
    const response = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'apikey': SUPABASE_SERVICE_KEY
      }
    });

    if (response.ok) {
      console.log('✅ Database connection successful!');
      
      // Check if tables exist by trying to query them
      const tables = ['profiles', 'posts', 'signals', 'events', 'courses'];
      let existingTables = 0;
      
      for (const table of tables) {
        try {
          const tableResponse = await fetch(`${SUPABASE_URL}/rest/v1/${table}?select=count`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'apikey': SUPABASE_SERVICE_KEY
            }
          });
          
          if (tableResponse.ok) {
            existingTables++;
            console.log(`✅ Table '${table}' exists`);
          }
        } catch (error) {
          console.log(`❌ Table '${table}' does not exist`);
        }
      }
      
      if (existingTables >= 5) {
        console.log('\n🎉 Database is already set up with all tables!');
        return true;
      } else {
        console.log(`\n⚠️  Only ${existingTables}/5 tables found. Database needs setup.`);
        return false;
      }
    } else {
      console.log('❌ Database connection failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Error checking database:', error.message);
    return false;
  }
}

async function createEnvFile() {
  try {
    const envContent = `NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_KEY}`;

    const envPath = path.join(__dirname, '..', '.env.local');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file with your credentials');
  } catch (error) {
    console.error('❌ Error creating .env.local:', error.message);
  }
}

async function main() {
  console.log('🚀 Trading Academy - Database Setup Guide');
  console.log('==========================================\n');

  try {
    // Check current database status
    const isSetup = await checkDatabaseStatus();
    
    if (isSetup) {
      console.log('\n✅ Database is already properly configured!');
      console.log('🎉 Your trading community platform is ready to use.');
    } else {
      console.log('\n🔧 Database needs setup. Here\'s how to set it up:\n');
      
      console.log('📋 STEP-BY-STEP SETUP INSTRUCTIONS:\n');
      
      console.log('1️⃣  Open your Supabase Dashboard:');
      console.log(`   ${SUPABASE_URL.replace('/rest/v1', '')}/dashboard\n`);
      
      console.log('2️⃣  Navigate to SQL Editor in your project\n');
      
      console.log('3️⃣  Copy and paste this SQL code:\n');
      
      // Read and display the SQL file
      const sqlFile = path.join(__dirname, '..', 'database_setup.sql');
      const sqlContent = fs.readFileSync(sqlFile, 'utf8');
      
      console.log('='.repeat(80));
      console.log(sqlContent);
      console.log('='.repeat(80));
      
      console.log('\n4️⃣  Click "Run" to execute the SQL\n');
      
      console.log('5️⃣  Verify the setup by checking:');
      console.log('   - Table Editor shows all tables created');
      console.log('   - Authentication > Users shows sample users');
      console.log('   - Database > Policies shows RLS enabled\n');
      
      console.log('6️⃣  Test your application:');
      console.log('   - Start the dev server: npm run dev');
      console.log('   - Visit: http://localhost:3001/signup');
      console.log('   - Create a new account and test the dashboard\n');
    }
    
    // Always create/update .env.local file
    await createEnvFile();
    
    console.log('📚 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit: http://localhost:3001/signup');
    console.log('3. Create a new account and test the dashboard');
    console.log('4. Explore all the features: community feed, signals, chat, etc.\n');
    
    console.log('🔗 Verify setup in Supabase Dashboard:');
    console.log(`   ${SUPABASE_URL.replace('/rest/v1', '')}/dashboard`);

  } catch (error) {
    console.error('❌ Error during check/setup:', error.message);
  }
}

main();
