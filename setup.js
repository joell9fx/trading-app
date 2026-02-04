#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Trading Academy - Supabase Setup');
console.log('=====================================\n');

console.log('Choose your setup method:\n');

console.log('1️⃣  Automated Setup (Recommended)');
console.log('   - Interactive setup with prompts');
console.log('   - Automatically creates .env.local');
console.log('   - Guides you through the process');
console.log('   Run: npm run setup:supabase\n');

console.log('2️⃣  Manual Setup');
console.log('   - Copy/paste SQL into Supabase dashboard');
console.log('   - Step-by-step instructions');
console.log('   - Good for learning the process');
console.log('   Run: npm run setup:manual\n');

console.log('3️⃣  Quick Start');
console.log('   - Just show me the SQL to copy');
console.log('   - I\'ll handle the rest manually');
console.log('   Run: npm run setup:manual\n');

console.log('📋 Prerequisites:');
console.log('   - Supabase account (free at https://supabase.com)');
console.log('   - Node.js installed');
console.log('   - Basic knowledge of copy/paste\n');

console.log('🎯 Recommended workflow:');
console.log('   1. Create Supabase project at https://supabase.com');
console.log('   2. Run: npm run setup:supabase');
console.log('   3. Follow the interactive prompts');
console.log('   4. Test your application: npm run dev\n');

console.log('🔗 Useful links:');
console.log('   - Supabase Dashboard: https://supabase.com/dashboard');
console.log('   - Create Project: https://supabase.com/new');
console.log('   - Documentation: https://supabase.com/docs\n');

console.log('💡 Need help?');
console.log('   - Check SUPABASE_SETUP.md for detailed instructions');
console.log('   - Review database_setup.sql to understand the schema');
console.log('   - Test the application after setup\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
if (fs.existsSync(envPath)) {
  console.log('✅ Found .env.local file');
  console.log('   Your Supabase credentials are already configured!\n');
} else {
  console.log('❌ No .env.local file found');
  console.log('   You\'ll need to create this during setup\n');
}

console.log('Ready to get started? Run one of the setup commands above! 🚀\n');

