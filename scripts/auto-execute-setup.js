
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
    console.log('🔗 Connecting to Supabase...');
    
    // Split SQL into individual statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      if (statement.trim()) {
        try {
          const response = await fetch(`${url}/rest/v1/rpc/exec_sql`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${serviceKey}`,
              'apikey': serviceKey
            },
            body: JSON.stringify({
              sql: statement + ';'
            })
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.log(`⚠️  Statement ${i + 1} had an issue: ${errorText}`);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (error) {
          console.log(`⚠️  Statement ${i + 1} error: ${error.message}`);
        }
      }
    }

    console.log('🎉 Database setup completed!');
    return true;
  } catch (error) {
    console.error('❌ Error executing SQL:', error.message);
    throw error;
  }
}

async function testConnection(url, serviceKey) {
  try {
    console.log('🔍 Testing connection to Supabase...');
    
    const response = await fetch(`${url}/rest/v1/profiles?select=count`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey
      }
    });

    if (response.ok) {
      console.log('✅ Connection successful!');
      return true;
    } else {
      console.log('❌ Connection failed');
      return false;
    }
  } catch (error) {
    console.log('❌ Connection error:', error.message);
    return false;
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

    console.log('\n🔍 Testing connection...');
    const connectionOk = await testConnection(supabaseUrl, supabaseServiceKey);
    
    if (!connectionOk) {
      console.log('\n❌ Could not connect to Supabase. Please check your credentials.');
      console.log('Make sure you\'re using the Service Role Key (not the anon key).');
      return;
    }

    // Read the SQL file
    const sqlFile = path.join(__dirname, '..', 'database_setup.sql');
    const sqlContent = fs.readFileSync(sqlFile, 'utf8');

    console.log('\n📋 Starting database setup...\n');

    // Execute the SQL
    await executeSQL(supabaseUrl, supabaseServiceKey, sqlContent);
    
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

    console.log('🔗 Verify setup in Supabase Dashboard:');
    console.log(`   ${supabaseUrl.replace('/rest/v1', '')}/dashboard`);

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

