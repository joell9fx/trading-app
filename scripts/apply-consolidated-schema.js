#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

async function main() {
  console.log('🚀 Apply Consolidated Database Schema');
  console.log('=====================================\n');

  try {
    // Read the consolidated schema file
    const schemaPath = path.join(__dirname, '..', 'supabase', 'migrations', '001_consolidated_schema.sql');
    
    if (!fs.existsSync(schemaPath)) {
      console.error('❌ Consolidated schema file not found at:', schemaPath);
      process.exit(1);
    }

    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    console.log('✅ Found consolidated schema file');
    console.log('📋 Database Setup Instructions:\n');
    
    console.log('1️⃣  Open your Supabase project dashboard:');
    console.log('   https://supabase.com/dashboard\n');
    
    console.log('2️⃣  Navigate to SQL Editor in your project\n');
    
    console.log('3️⃣  Copy and paste this SQL code:\n');
    
    console.log('================================================================================');
    console.log(schemaContent);
    console.log('================================================================================\n');
    
    console.log('4️⃣  Click "Run" to execute the SQL\n');
    
    console.log('5️⃣  Verify the setup by checking:');
    console.log('   - Table Editor shows all tables created');
    console.log('   - Authentication > Users shows sample users');
    console.log('   - Database > Policies shows RLS enabled\n');
    
    console.log('6️⃣  Test your application:');
    console.log('   - Start the dev server: npm run dev');
    console.log('   - Visit: http://localhost:3000/api/test-supabase');
    console.log('   - Test other API endpoints\n');
    
    console.log('✅ Setup complete! Your consolidated trading platform schema is ready.\n');
    
    console.log('🔧 Troubleshooting:');
    console.log('   - If you get connection errors, check your .env.local file');
    console.log('   - If tables aren\'t created, run the SQL again');
    console.log('   - If RLS errors occur, check the policies in Table Editor');
    console.log('   - If you get conflicts, you may need to drop existing tables first\n');
    
    console.log('🎯 This schema includes:');
    console.log('   - Complete trading platform tables');
    console.log('   - Community features (posts, comments, likes)');
    console.log('   - Course management system');
    console.log('   - Mentorship and booking system');
    console.log('   - Trading signals and events');
    console.log('   - Comprehensive RLS policies');
    console.log('   - Sample data for testing');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
