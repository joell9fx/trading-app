#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Read the SQL file
const sqlFile = path.join(__dirname, '..', 'database_setup.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

console.log('🚀 Supabase Database Setup Script');
console.log('=====================================\n');

console.log('📋 To automatically set up your Supabase database, follow these steps:\n');

console.log('1️⃣  Create a Supabase project:');
console.log('   - Go to https://supabase.com');
console.log('   - Click "New Project"');
console.log('   - Choose your organization');
console.log('   - Enter project name: "trading-academy"');
console.log('   - Set a database password');
console.log('   - Choose a region close to you');
console.log('   - Click "Create new project"\n');

console.log('2️⃣  Get your project credentials:');
console.log('   - Go to Settings > API in your project dashboard');
console.log('   - Copy your Project URL and anon key\n');

console.log('3️⃣  Create .env.local file:');
console.log('   Create a file named .env.local in your project root with:\n');

console.log('   NEXT_PUBLIC_SUPABASE_URL=your_project_url_here');
console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here');
console.log('   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here\n');

console.log('4️⃣  Run the database setup:');
console.log('   - Go to your Supabase project dashboard');
console.log('   - Navigate to SQL Editor');
console.log('   - Copy and paste the following SQL:\n');

console.log('='.repeat(80));
console.log(sqlContent);
console.log('='.repeat(80));

console.log('\n5️⃣  Click "Run" to execute the SQL\n');

console.log('6️⃣  Verify setup:');
console.log('   - Check that all tables are created in the Table Editor');
console.log('   - Verify RLS policies are enabled');
console.log('   - Test the application at http://localhost:3001\n');

console.log('✅ Setup complete! Your trading community platform is ready.\n');

console.log('📚 Next steps:');
console.log('   - Test user registration at /signup');
console.log('   - Test authentication at /signin');
console.log('   - Explore the dashboard features');
console.log('   - Customize the sample data as needed\n');

console.log('🔗 Useful links:');
console.log('   - Supabase Dashboard: https://supabase.com/dashboard');
console.log('   - Documentation: https://supabase.com/docs');
console.log('   - Community: https://github.com/supabase/supabase\n');

