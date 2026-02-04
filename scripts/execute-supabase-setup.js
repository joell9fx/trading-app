#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function executeSQL(url, serviceKey, sql) {
  try {
    const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      },
      body: JSON.stringify({
        sql: sql
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error executing SQL:', error.message);
    throw error;
  }
}

async function main() {
  console.log('🚀 Automated Supabase Database Setup');
  console.log('=====================================\n');

  try {
    // Get Supabase credentials
    console.log('Please provide your Supabase credentials:\n');
    
    const supabaseUrl = await question('Enter your Supabase Project URL: ');
    const supabaseServiceKey = await question('Enter your Supabase Service Role Key: ');

    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'database_setup.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('\n📋 Setting up database...\n');

    // Execute the SQL
    console.log('Executing database setup SQL...');
    const result = await executeSQL(supabaseUrl, supabaseServiceKey, sqlContent);
    
    console.log('✅ Database setup completed successfully!');
    console.log('Result:', result);

    // Create .env.local file
    const envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseServiceKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}`;

    const envPath = path.join(__dirname, '..', '.env.local');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ Created .env.local file');

    console.log('\n🎉 Setup complete! Your trading community platform is ready.\n');

    console.log('📚 Next steps:');
    console.log('1. Start your development server: npm run dev');
    console.log('2. Visit: http://localhost:3001/signup');
    console.log('3. Create a new account and test the dashboard');
    console.log('4. Explore all the features: community feed, signals, chat, etc.\n');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
    console.log('\n🔧 Manual setup instructions:');
    console.log('1. Go to your Supabase dashboard');
    console.log('2. Navigate to SQL Editor');
    console.log('3. Copy the contents of database_setup.sql');
    console.log('4. Paste and execute the SQL');
    console.log('5. Create .env.local with your credentials');
  } finally {
    rl.close();
  }
}

main();

