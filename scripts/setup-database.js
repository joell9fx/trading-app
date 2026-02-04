#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Trading Academy Database Setup');
console.log('=====================================\n');

// Read the SQL file
const sqlFile = path.join(__dirname, '..', 'supabase_setup.sql');
const sqlContent = fs.readFileSync(sqlFile, 'utf8');

console.log('📋 Follow these steps to set up your database:\n');

console.log('1️⃣  Go to your Supabase Dashboard:');
console.log('   https://supabase.com/dashboard\n');

console.log('2️⃣  Select your project: cfnfrxnxnavlknrjujurj\n');

console.log('3️⃣  Go to SQL Editor (left sidebar)\n');

console.log('4️⃣  Click "New Query"\n');

console.log('5️⃣  Copy and paste the SQL below into the editor:\n');

console.log('='.repeat(80));
console.log(sqlContent);
console.log('='.repeat(80));

console.log('\n6️⃣  Click "Run" to execute the SQL\n');

console.log('7️⃣  You should see: "Database setup completed successfully!"\n');

console.log('✅ After setup, you can create new accounts without database errors!\n');

console.log('🔗 Your Supabase Project URL: https://cffqnrxnavlknrijuurj.supabase.co');
console.log('🔑 Your credentials are already in .env.local\n');

console.log('🎉 Once the database is set up, try creating a new account again!');
