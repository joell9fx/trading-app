# Trading Community Platform

A comprehensive full-stack trading community platform built with Next.js, TypeScript, Tailwind CSS, and Firebase. This platform provides a complete solution for trading communities with real-time features, educational content, mentorship, and AI-powered assistance.

## 🚀 Features

### Core Features
- **Authentication System**: Secure user sign-up, login, and logout with OAuth (Google) support
- **Role-based Access**: Admin and Member roles with different permissions
- **Dashboard**: Comprehensive overview with stats, recent activity, and quick actions
- **Real-time Chat**: Community chat with multiple channels and real-time messaging
- **Trading Signals**: Professional trading signals with detailed analysis and risk management
- **Educational Courses**: Structured learning modules with progress tracking
- **Mentorship System**: 1-on-1 session booking and management
- **AI Trading Assistant**: GPT-powered trading guidance and analysis
- **Funding Program**: Application system for funded trading accounts

### Technical Features
- **Responsive Design**: Fully responsive across desktop, tablet, and mobile
- **Dark/Light Mode**: Toggle between dark and light themes
- **Real-time Updates**: WebSocket integration for live chat and notifications
- **File Upload**: Support for images and documents
- **Search & Filtering**: Advanced search and filtering capabilities
- **Admin Panel**: Comprehensive admin dashboard for community management

## 🛠 Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Framer Motion**: Smooth animations and transitions
- **Lucide React**: Beautiful icons
- **React Hook Form**: Form handling and validation
- **React Hot Toast**: Toast notifications

### Backend
- **Firebase**: Backend-as-a-Service
  - **Authentication**: User management and OAuth
  - **Firestore**: NoSQL database
  - **Storage**: File upload and management
- **Socket.io**: Real-time communication
- **OpenAI API**: AI-powered trading assistance

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Static type checking

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Firebase account
- OpenAI API key (optional)

### 1. Clone the Repository
```bash
git clone <repository-url>
cd trading-community-platform
```

### 2. Install Dependencies
```bash
npm install
# or
yarn install
```

### 3. Environment Setup
Copy the example environment file and configure your variables:

```bash
cp env.example .env.local
```

Fill in your environment variables:

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Socket.io Configuration
SOCKET_URL=http://localhost:3001
```

### 4. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication with Email/Password and Google providers
3. Create a Firestore database in test mode
4. Enable Storage for file uploads
5. Copy your Firebase configuration to `.env.local`

### 5. Run the Development Server
```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Landing page
├── components/            # Reusable components
│   ├── layout/           # Layout components
│   └── ui/               # UI components
├── contexts/             # React contexts
├── hooks/                # Custom hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript type definitions
└── utils/                # Utility functions
```

## 🔧 Configuration

### Firebase Security Rules

Set up Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Signals - read for all authenticated users, write for admins
    match /signals/{signalId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
    
    // Chat messages - read/write for authenticated users
    match /chatMessages/{messageId} {
      allow read, write: if request.auth != null;
    }
    
    // Courses - read for authenticated users, write for admins
    match /courses/{courseId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

### Storage Rules

Set up Firebase Storage rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Manual Deployment

1. Build the application:
```bash
npm run build
```

2. Start the production server:
```bash
npm start
```

## 📱 Features in Detail

### Authentication
- Email/password registration and login
- Google OAuth integration
- Email verification
- Password reset functionality
- Role-based access control

### Dashboard
- Overview statistics
- Recent activity feed
- Quick action buttons
- Upcoming events
- Responsive design

### Trading Signals
- Professional signal posting (admin only)
- Detailed analysis and risk management
- Like and comment system
- Status tracking (active/completed/cancelled)
- Image upload support
- Search and filtering

### Community Chat
- Real-time messaging
- Multiple channels (general, signals, announcements)
- Message reactions
- File sharing
- Admin moderation tools

### Educational Courses
- Structured learning modules
- Progress tracking
- Video and text content
- Quiz integration
- Certificate system

### Mentorship
- Session booking system
- Calendar integration
- Video call support
- Session recording
- Feedback system

### AI Trading Assistant
- GPT-powered analysis
- Strategy guidance
- Chart pattern explanation
- FAQ support
- Context-aware responses

### Funding Program
- Application system
- Evaluation tracking
- Performance metrics
- Progress monitoring
- Admin review system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@tradingcommunity.com or create an issue in the repository.

## 🔮 Roadmap

- [ ] Mobile app development
- [ ] Advanced charting integration
- [ ] Social trading features
- [ ] Automated trading signals
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Advanced notification system
- [ ] Integration with trading platforms

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Firebase for the robust backend services
- Tailwind CSS for the utility-first approach
- The open-source community for inspiration and tools
