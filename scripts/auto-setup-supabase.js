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

async function main() {
  console.log('🚀 Automated Supabase Database Setup');
  console.log('=====================================\n');

  try {
    // Check if .env.local exists
    const envPath = path.join(__dirname, '..', '.env.local');
    let envContent = '';
    
    if (fs.existsSync(envPath)) {
      envContent = fs.readFileSync(envPath, 'utf8');
      console.log('✅ Found .env.local file');
    } else {
      console.log('❌ .env.local file not found');
      console.log('Please create .env.local with your Supabase credentials first.\n');
      
      const supabaseUrl = await question('Enter your Supabase Project URL: ');
      const supabaseAnonKey = await question('Enter your Supabase Anon Key: ');
      const supabaseServiceKey = await question('Enter your Supabase Service Role Key: ');
      
      envContent = `NEXT_PUBLIC_SUPABASE_URL=${supabaseUrl}
NEXT_PUBLIC_SUPABASE_ANON_KEY=${supabaseAnonKey}
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}`;
      
      fs.writeFileSync(envPath, envContent);
      console.log('✅ Created .env.local file\n');
    }

    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'database_setup.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('📋 Database Setup Instructions:\n');

    console.log('1️⃣  Open your Supabase project dashboard:');
    console.log('   https://supabase.com/dashboard\n');

    console.log('2️⃣  Navigate to SQL Editor in your project\n');

    console.log('3️⃣  Copy and paste this SQL code:\n');

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

    console.log('✅ Setup complete! Your trading community platform is ready.\n');

    console.log('🔧 Troubleshooting:');
    console.log('   - If you get connection errors, check your .env.local file');
    console.log('   - If tables aren\'t created, run the SQL again');
    console.log('   - If RLS errors occur, check the policies in Table Editor\n');

  } catch (error) {
    console.error('❌ Error during setup:', error.message);
  } finally {
    rl.close();
  }
}

main();

