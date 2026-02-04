#!/usr/bin/env node

/**
 * Firebase Database Setup Script
 * 
 * This script initializes your Firebase database with sample data for the trading platform.
 * Run this script after setting up your Firebase project and environment variables.
 * 
 * Usage:
 *   node scripts/setup-firebase.js
 * 
 * Prerequisites:
 *   1. Firebase project created
 *   2. Environment variables configured in .env.local
 *   3. Firestore database enabled
 *   4. Authentication enabled
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 Firebase Database Setup Script');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.error('❌ Error: .env.local file not found!');
  console.log('Please create a .env.local file with your Firebase configuration:');
  console.log('');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key');
  console.log('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id');
  console.log('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com');
  console.log('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789');
  console.log('NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id');
  console.log('');
  process.exit(1);
}

// Check if Firebase config is properly set up
const envContent = fs.readFileSync(envPath, 'utf8');
const requiredVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
];

const missingVars = requiredVars.filter(varName => !envContent.includes(varName));

if (missingVars.length > 0) {
  console.error('❌ Error: Missing Firebase environment variables:');
  missingVars.forEach(varName => console.log(`   - ${varName}`));
  console.log('');
  console.log('Please update your .env.local file with the missing variables.');
  process.exit(1);
}

console.log('✅ Environment variables configured');
console.log('✅ Firebase configuration found\n');

// Create a temporary setup file
const setupScript = `
import { setupDatabase, initializeCollections } from '../src/lib/firebase-setup';

async function runSetup() {
  try {
    console.log('🔧 Initializing collections...');
    await initializeCollections();
    
    console.log('📊 Setting up sample data...');
    const success = await setupDatabase();
    
    if (success) {
      console.log('\\n🎉 Firebase database setup completed successfully!');
      console.log('\\n📋 What was created:');
      console.log('   • 3 sample users (admin, joel, sarah)');
      console.log('   • 3 trading signals');
      console.log('   • 3 chat messages');
      console.log('   • 2 educational courses');
      console.log('   • 1 mentorship session');
      console.log('   • 1 funding application');
      console.log('   • 2 notifications');
      console.log('   • 1 AI conversation');
      console.log('   • Analytics dashboard data');
      console.log('\\n🌐 You can now run your application with: npm run dev');
    } else {
      console.error('❌ Database setup failed');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error during setup:', error);
    process.exit(1);
  }
}

runSetup();
`;

const tempSetupPath = path.join(process.cwd(), 'temp-setup.mjs');
fs.writeFileSync(tempSetupPath, setupScript);

try {
  console.log('🔄 Running database setup...\n');
  
  // Run the setup script
  execSync(`node ${tempSetupPath}`, { 
    stdio: 'inherit',
    cwd: process.cwd()
  });
  
  console.log('\n✅ Setup completed successfully!');
  
} catch (error) {
  console.error('\n❌ Setup failed:', error.message);
  process.exit(1);
} finally {
  // Clean up temporary file
  if (fs.existsSync(tempSetupPath)) {
    fs.unlinkSync(tempSetupPath);
  }
}

console.log('\n📚 Next Steps:');
console.log('   1. Open your Firebase Console to verify the data');
console.log('   2. Run your application: npm run dev');
console.log('   3. Test the features with the sample data');
console.log('\n🔗 Firebase Console: https://console.firebase.google.com/');
console.log('📖 Documentation: https://firebase.google.com/docs/firestore');
