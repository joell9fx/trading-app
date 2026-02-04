import { db } from './firebase';
import {
  collection,
  doc,
  setDoc,
  addDoc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import {
  userService,
  signalService,
  chatService,
  courseService,
  mentorshipService,
  fundingService,
  notificationService,
  aiBotService,
  analyticsService,
} from './firebase-services';

// ============================================================================
// SAMPLE DATA
// ============================================================================

const sampleUsers = [
  {
    email: 'admin@tradepro.com',
    displayName: 'Admin User',
    photoURL: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    role: 'admin' as const,
    membershipLevel: 'vip' as const,
    isEmailVerified: true,
    profile: {
      bio: 'Platform administrator and trading expert',
      tradingExperience: '10+ years',
      preferredMarkets: ['forex', 'crypto'],
      timezone: 'UTC-5',
    },
  },
  {
    email: 'joel@tradepro.com',
    displayName: 'Joel Trader',
    photoURL: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    role: 'member' as const,
    membershipLevel: 'premium' as const,
    isEmailVerified: true,
    profile: {
      bio: 'Passionate forex trader with 5 years experience',
      tradingExperience: '5 years',
      preferredMarkets: ['forex'],
      timezone: 'UTC-5',
    },
  },
  {
    email: 'sarah@tradepro.com',
    displayName: 'Sarah Johnson',
    photoURL: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
    role: 'member' as const,
    membershipLevel: 'premium' as const,
    isEmailVerified: true,
    profile: {
      bio: 'Crypto specialist and technical analyst',
      tradingExperience: '8 years',
      preferredMarkets: ['crypto'],
      timezone: 'UTC-8',
    },
  },
];

const sampleSignals = [
  {
    title: 'EURUSD Breakout Signal',
    description: 'EURUSD is showing a strong breakout pattern on the 4H timeframe. Key resistance at 1.0850 has been broken with strong volume.',
    symbol: 'EURUSD',
    type: 'buy' as const,
    entryPrice: 1.0850,
    stopLoss: 1.0800,
    takeProfit: 1.0950,
    riskRewardRatio: 2.0,
    market: 'forex' as const,
    status: 'active' as const,
    createdBy: 'admin@tradepro.com',
    isPinned: true,
    tags: ['breakout', 'forex', 'eurusd'],
  },
  {
    title: 'BTCUSD Bull Flag Pattern',
    description: 'Bitcoin is forming a bullish flag pattern on the daily timeframe. Looking for continuation after the consolidation.',
    symbol: 'BTCUSD',
    type: 'buy' as const,
    entryPrice: 45000,
    stopLoss: 44000,
    takeProfit: 48000,
    riskRewardRatio: 3.0,
    market: 'crypto' as const,
    status: 'active' as const,
    createdBy: 'sarah@tradepro.com',
    isPinned: false,
    tags: ['bull-flag', 'crypto', 'bitcoin'],
  },
  {
    title: 'GBPUSD Support Rejection',
    description: 'GBPUSD rejected from key support level. Looking for short entry on retest of resistance.',
    symbol: 'GBPUSD',
    type: 'sell' as const,
    entryPrice: 1.2500,
    stopLoss: 1.2550,
    takeProfit: 1.2350,
    riskRewardRatio: 1.5,
    market: 'forex' as const,
    status: 'active' as const,
    createdBy: 'admin@tradepro.com',
    isPinned: false,
    tags: ['support', 'forex', 'gbpusd'],
  },
];

const sampleChatMessages = [
  {
    content: 'Welcome to TradePro! 🎉 This is our general trading discussion channel.',
    createdBy: 'admin@tradepro.com',
    channel: 'general' as const,
    type: 'text' as const,
    isPinned: true,
    tags: ['welcome'],
  },
  {
    content: 'What\'s everyone\'s take on EURUSD today?',
    createdBy: 'joel@tradepro.com',
    channel: 'general' as const,
    type: 'text' as const,
    isPinned: false,
    tags: ['forex', 'eurusd'],
  },
  {
    content: 'Looking bullish on the 4H timeframe. Key resistance at 1.0850.',
    createdBy: 'sarah@tradepro.com',
    channel: 'general' as const,
    type: 'text' as const,
    isPinned: false,
    tags: ['analysis', 'bullish'],
  },
];

const sampleCourses = [
  {
    title: 'Trading Fundamentals',
    description: 'Learn the basics of trading, including market structure, risk management, and psychology.',
    thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=250&fit=crop',
    modules: [
      {
        id: 'module-1',
        title: 'Introduction to Trading',
        description: 'Basic concepts and terminology',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'What is Trading?',
            content: 'Trading is the act of buying and selling financial instruments...',
            type: 'text' as const,
            duration: 15,
            order: 1,
            isCompleted: false,
          },
          {
            id: 'lesson-1-2',
            title: 'Market Types',
            content: 'There are different types of markets: forex, stocks, crypto...',
            type: 'video' as const,
            duration: 20,
            videoUrl: 'https://example.com/video1.mp4',
            order: 2,
            isCompleted: false,
          },
        ],
        order: 1,
      },
    ],
    difficulty: 'beginner' as const,
    duration: 120,
    price: 0,
    isPublished: true,
    enrolledUsers: [],
  },
  {
    title: 'Advanced Trading Strategies',
    description: 'Master advanced trading techniques including technical analysis and risk management.',
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop',
    modules: [
      {
        id: 'module-1',
        title: 'Technical Analysis',
        description: 'Advanced chart patterns and indicators',
        lessons: [
          {
            id: 'lesson-1-1',
            title: 'Chart Patterns',
            content: 'Learn to identify key chart patterns...',
            type: 'video' as const,
            duration: 30,
            videoUrl: 'https://example.com/video2.mp4',
            order: 1,
            isCompleted: false,
          },
        ],
        order: 1,
      },
    ],
    difficulty: 'intermediate' as const,
    duration: 180,
    price: 99,
    isPublished: true,
    enrolledUsers: [],
  },
];

const sampleMentorshipSessions = [
  {
    title: 'Strategy Review Session',
    description: 'Review of current trading strategies and performance analysis',
    mentorId: 'admin@tradepro.com',
    menteeId: 'joel@tradepro.com',
    scheduledAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    duration: 60,
    status: 'scheduled' as const,
    meetingLink: 'https://meet.google.com/abc-defg-hij',
  },
];

const sampleFundingApplications = [
  {
    userId: 'joel@tradepro.com',
    accountSize: 10000,
    tradingPlan: 'Focus on forex pairs with 2:1 risk-reward ratio. Maximum 2% risk per trade.',
    experience: '5 years of forex trading experience',
    goals: 'Achieve consistent monthly returns of 5-10%',
    status: 'in_progress' as const,
    evaluationResults: {
      winRate: 65,
      profitFactor: 1.8,
      maxDrawdown: 8,
      consistency: 75,
    },
  },
];

const sampleNotifications = [
  {
    userId: 'joel@tradepro.com',
    title: 'New Signal Available',
    message: 'EURUSD Breakout Signal has been posted. Check it out!',
    type: 'info' as const,
    isRead: false,
    actionUrl: '/dashboard/signals',
  },
  {
    userId: 'joel@tradepro.com',
    title: 'Mentorship Session Reminder',
    message: 'Your session with Admin User is scheduled for tomorrow at 10:00 AM EST',
    type: 'warning' as const,
    isRead: false,
    actionUrl: '/dashboard/mentorship',
  },
];

const sampleAIConversations = [
  {
    userId: 'joel@tradepro.com',
    message: 'What\'s the best risk management strategy for a breakout trade?',
    response: 'For breakout trades, I recommend: 1. Position sizing: 1-2% risk per trade 2. Stop loss: Below the breakout level 3. Take profit: 2:1 or 3:1 risk-reward ratio 4. Volume confirmation for validity',
    context: 'strategy' as const,
  },
];

// ============================================================================
// DATABASE SETUP FUNCTIONS
// ============================================================================

export const setupDatabase = async () => {
  console.log('🚀 Starting Firebase database setup...');

  try {
    // Create users
    console.log('📝 Creating sample users...');
    const userIds: string[] = [];
    for (const userData of sampleUsers) {
      const userId = await userService.createUser(userData);
      userIds.push(userId);
      console.log(`✅ Created user: ${userData.displayName}`);
    }

    // Create signals
    console.log('📈 Creating sample signals...');
    for (const signalData of sampleSignals) {
      await signalService.createSignal(signalData);
      console.log(`✅ Created signal: ${signalData.title}`);
    }

    // Create chat messages
    console.log('💬 Creating sample chat messages...');
    for (const messageData of sampleChatMessages) {
      await chatService.sendMessage(messageData);
      console.log(`✅ Created message: ${messageData.content.substring(0, 50)}...`);
    }

    // Create courses
    console.log('📚 Creating sample courses...');
    for (const courseData of sampleCourses) {
      await courseService.createCourse(courseData);
      console.log(`✅ Created course: ${courseData.title}`);
    }

    // Create mentorship sessions
    console.log('👥 Creating sample mentorship sessions...');
    for (const sessionData of sampleMentorshipSessions) {
      await mentorshipService.createSession(sessionData);
      console.log(`✅ Created session: ${sessionData.title}`);
    }

    // Create funding applications
    console.log('💰 Creating sample funding applications...');
    for (const applicationData of sampleFundingApplications) {
      await fundingService.submitApplication(applicationData);
      console.log(`✅ Created application for: ${applicationData.userId}`);
    }

    // Create notifications
    console.log('🔔 Creating sample notifications...');
    for (const notificationData of sampleNotifications) {
      await notificationService.createNotification(notificationData);
      console.log(`✅ Created notification: ${notificationData.title}`);
    }

    // Create AI conversations
    console.log('🤖 Creating sample AI conversations...');
    for (const conversationData of sampleAIConversations) {
      await aiBotService.saveConversation(conversationData);
      console.log(`✅ Created AI conversation: ${conversationData.message.substring(0, 50)}...`);
    }

    // Update analytics
    console.log('📊 Updating analytics...');
    await analyticsService.updateAnalytics();
    console.log('✅ Analytics updated');

    console.log('🎉 Database setup completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error setting up database:', error);
    return false;
  }
};

// ============================================================================
// COLLECTION INITIALIZATION
// ============================================================================

export const initializeCollections = async () => {
  console.log('🔧 Initializing Firestore collections...');

  const collections = [
    'users',
    'signals',
    'chat_messages',
    'courses',
    'course_progress',
    'mentorship_sessions',
    'funding_applications',
    'notifications',
    'ai_conversations',
    'analytics',
  ];

  try {
    for (const collectionName of collections) {
      // Create a dummy document to ensure the collection exists
      const dummyDoc = await addDoc(collection(db, collectionName), {
        _initialized: true,
        createdAt: serverTimestamp(),
      });
      
      // Delete the dummy document
      await setDoc(doc(db, collectionName, dummyDoc.id), {
        _deleted: true,
        deletedAt: serverTimestamp(),
      });

      console.log(`✅ Initialized collection: ${collectionName}`);
    }

    console.log('🎉 All collections initialized successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error initializing collections:', error);
    return false;
  }
};

// ============================================================================
// DATABASE RESET (USE WITH CAUTION)
// ============================================================================

export const resetDatabase = async () => {
  console.log('⚠️  WARNING: This will delete all data in the database!');
  console.log('This function is for development purposes only.');
  
  // In a real application, you would implement proper deletion logic here
  // For now, we'll just log a warning
  console.log('🔄 Database reset functionality not implemented for safety.');
  console.log('Please manually delete collections from Firebase Console if needed.');
};

// ============================================================================
// EXPORT ALL FUNCTIONS
// ============================================================================

export default {
  setupDatabase,
  initializeCollections,
  resetDatabase,
};
