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

async function setupDatabase() {
  try {
    console.log('\n🚀 Setting up database...');
    
    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'database_setup.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');
    
    // Split SQL into individual statements
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
              'apikey': SUPABASE_SERVICE_KEY
            },
            body: JSON.stringify({
              sql: statement + ';'
            })
          });

          if (response.ok) {
            successCount++;
            console.log(`✅ Statement ${i + 1} executed successfully`);
          } else {
            errorCount++;
            const errorText = await response.text();
            console.log(`⚠️  Statement ${i + 1} had an issue: ${errorText}`);
          }
        } catch (error) {
          errorCount++;
          console.log(`⚠️  Statement ${i + 1} error: ${error.message}`);
        }
      }
    }

    console.log(`\n📊 Setup Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Errors: ${errorCount}`);
    
    return errorCount === 0;
  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
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
  console.log('🚀 Trading Academy - Database Check & Setup');
  console.log('============================================\n');

  try {
    // Check current database status
    const isSetup = await checkDatabaseStatus();
    
    if (isSetup) {
      console.log('\n✅ Database is already properly configured!');
      console.log('🎉 Your trading community platform is ready to use.');
    } else {
      console.log('\n🔧 Database needs setup. Starting automatic setup...');
      
      // Setup the database
      const setupSuccess = await setupDatabase();
      
      if (setupSuccess) {
        console.log('\n🎉 Database setup completed successfully!');
      } else {
        console.log('\n⚠️  Database setup had some issues. Check the logs above.');
      }
    }
    
    // Always create/update .env.local file
    await createEnvFile();
    
    console.log('\n📚 Next steps:');
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
