# 🔥 Firebase Setup Guide for TradePro

This guide will help you set up Firebase for your trading community platform, including authentication, Firestore database, and sample data.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase account
- Git repository cloned

## 🚀 Step 1: Create Firebase Project

1. **Go to Firebase Console**
   - Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
   - Click "Create a project" or "Add project"

2. **Project Setup**
   - **Project name**: `tradepro-platform` (or your preferred name)
   - **Enable Google Analytics**: Optional (recommended)
   - Click "Create project"

3. **Configure Project**
   - Choose your analytics account or create a new one
   - Click "Continue"

## 🔧 Step 2: Enable Firebase Services

### Authentication
1. In Firebase Console, go to **Authentication** → **Get started**
2. Click **Sign-in method** tab
3. Enable these providers:
   - **Email/Password** ✅
   - **Google** ✅ (recommended)
4. For Google provider:
   - Click "Enable"
   - Add your authorized domain (localhost for development)
   - Save

### Firestore Database
1. Go to **Firestore Database** → **Create database**
2. Choose **Start in test mode** (for development)
3. Select a location close to your users
4. Click **Done**

### Storage (Optional)
1. Go to **Storage** → **Get started**
2. Choose **Start in test mode**
3. Select the same location as Firestore
4. Click **Done**

## 🔑 Step 3: Get Firebase Configuration

1. **Project Settings**
   - Click the gear icon ⚙️ next to "Project Overview"
   - Select "Project settings"

2. **Add Web App**
   - Scroll down to "Your apps" section
   - Click the web icon `</>`
   - Enter app nickname: `TradePro Web`
   - Click "Register app"

3. **Copy Configuration**
   - Copy the Firebase config object
   - It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

## ⚙️ Step 4: Configure Environment Variables

1. **Create `.env.local` file**
   ```bash
   cp env.example .env.local
   ```

2. **Update `.env.local` with your Firebase config**
   ```env
   # Firebase Configuration
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

   # NextAuth Configuration
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your_nextauth_secret_here

   # OpenAI Configuration (for AI Bot)
   OPENAI_API_KEY=your_openai_api_key_here

   # Socket.io Configuration
   SOCKET_URL=http://localhost:3001
   ```

## 🗄️ Step 5: Initialize Database

1. **Run the setup script**
   ```bash
   node scripts/setup-firebase.js
   ```

2. **What the script does**:
   - ✅ Creates all necessary Firestore collections
   - ✅ Adds sample users (admin, joel, sarah)
   - ✅ Creates sample trading signals
   - ✅ Adds sample chat messages
   - ✅ Creates educational courses
   - ✅ Sets up mentorship sessions
   - ✅ Adds funding applications
   - ✅ Creates notifications
   - ✅ Adds AI conversations
   - ✅ Initializes analytics data

## 🔒 Step 6: Security Rules (Production)

For production, update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Signals are readable by all authenticated users, writable by admins
    match /signals/{signalId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Chat messages are readable/writable by authenticated users
    match /chat_messages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Courses are readable by all, writable by admins
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Other collections follow similar patterns
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🧪 Step 7: Test the Setup

1. **Start the development server**
   ```bash
   npm run dev
   ```

2. **Test authentication**
   - Go to `http://localhost:3000/auth/signup`
   - Create a test account
   - Verify it appears in Firebase Console

3. **Test database operations**
   - Navigate to different pages
   - Check if data loads correctly
   - Verify real-time updates work

## 📊 Database Structure

### Collections Created:

```
📁 users/
├── 👤 User profiles
├── 🏷️  Roles (admin/member)
└── 📈 Membership levels

📁 signals/
├── 📈 Trading signals
├── 💰 Risk/reward data
└── 🏷️  Market categories

📁 chat_messages/
├── 💬 Real-time messages
├── 📺 Channels (general/signals/announcements)
└── 😊 Reactions

📁 courses/
├── 📚 Educational content
├── 📹 Video lessons
└── 📊 Progress tracking

📁 mentorship_sessions/
├── 👥 1-on-1 sessions
├── 📅 Scheduling
└── 📝 Session notes

📁 funding_applications/
├── 💰 Account applications
├── 📊 Evaluation results
└── 📈 Performance metrics

📁 notifications/
├── 🔔 User notifications
├── 📱 Real-time alerts
└── 🔗 Action links

📁 ai_conversations/
├── 🤖 AI chat history
├── 🧠 Context tracking
└── 📊 Usage analytics

📁 analytics/
└── 📊 Platform statistics
```

## 🔍 Troubleshooting

### Common Issues:

1. **"Firebase not initialized"**
   - Check your environment variables
   - Ensure `.env.local` exists
   - Restart the development server

2. **"Permission denied"**
   - Check Firestore security rules
   - Verify authentication is working
   - Check user roles and permissions

3. **"Collection not found"**
   - Run the setup script again
   - Check Firebase Console for collections
   - Verify collection names match

4. **"Authentication failed"**
   - Check Firebase Auth settings
   - Verify authorized domains
   - Check Google OAuth configuration

### Debug Commands:

```bash
# Check environment variables
node -e "console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)"

# Test Firebase connection
node -e "
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');
const app = initializeApp({
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
});
const db = getFirestore(app);
console.log('Firebase initialized successfully');
"
```

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Next.js with Firebase](https://nextjs.org/docs/authentication)

## 🎉 Success!

Once you've completed these steps, your trading platform will have:

- ✅ **Real-time database** with Firestore
- ✅ **User authentication** with Firebase Auth
- ✅ **Sample data** for testing
- ✅ **Security rules** for data protection
- ✅ **Analytics** for platform insights

You can now start building and testing your trading community features!
