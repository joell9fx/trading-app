export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'member';
  membershipLevel: 'free' | 'premium' | 'vip';
  createdAt: Date;
  lastLoginAt: Date;
  isEmailVerified: boolean;
  profile: {
    bio?: string;
    tradingExperience?: string;
    preferredMarkets?: string[];
    timezone?: string;
  };
}

export interface Signal {
  id: string;
  title: string;
  description: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  riskRewardRatio: number;
  market: 'forex' | 'crypto' | 'stocks' | 'commodities';
  imageUrl?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: Date;
  createdBy: string;
  likes: string[];
  comments: Comment[];
  isPinned: boolean;
  tags: string[];
}

export interface Comment {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  likes: string[];
  replies: Comment[];
}

export interface ChatMessage {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  channel: 'general' | 'signals' | 'announcements';
  type: 'text' | 'image' | 'file';
  fileUrl?: string;
  reactions: Reaction[];
  isPinned: boolean;
  tags: string[];
}

export interface Reaction {
  emoji: string;
  users: string[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  modules: Module[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // in minutes
  price: number;
  isPublished: boolean;
  createdAt: Date;
  updatedAt: Date;
  enrolledUsers: string[];
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  content: string;
  type: 'video' | 'text' | 'quiz';
  duration: number; // in minutes
  videoUrl?: string;
  attachments: string[];
  order: number;
  isCompleted: boolean;
}

export interface MentorshipSession {
  id: string;
  title: string;
  description: string;
  mentorId: string;
  menteeId: string;
  scheduledAt: Date;
  duration: number; // in minutes
  status: 'scheduled' | 'completed' | 'cancelled';
  meetingLink?: string;
  recordingUrl?: string;
  notes?: string;
  rating?: number;
  feedback?: string;
}

export interface FundingApplication {
  id: string;
  userId: string;
  accountSize: number;
  tradingPlan: string;
  experience: string;
  goals: string;
  status: 'pending' | 'approved' | 'rejected' | 'in_progress';
  submittedAt: Date;
  reviewedAt?: Date;
  reviewerId?: string;
  feedback?: string;
  evaluationResults?: {
    winRate: number;
    profitFactor: number;
    maxDrawdown: number;
    consistency: number;
  };
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

export interface AIBotMessage {
  id: string;
  userId: string;
  message: string;
  response: string;
  createdAt: Date;
  context: 'strategy' | 'chart' | 'faq' | 'general';
}

export interface Analytics {
  totalUsers: number;
  activeUsers: number;
  totalSignals: number;
  activeSignals: number;
  totalCourses: number;
  totalEnrollments: number;
  aiBotUsage: number;
  chatMessages: number;
  mentorshipSessions: number;
  fundingApplications: number;
}

export interface DashboardStats {
  userStats: {
    totalMembers: number;
    newMembersThisMonth: number;
    activeMembers: number;
  };
  tradingStats: {
    totalSignals: number;
    activeSignals: number;
    successRate: number;
    totalProfit: number;
  };
  engagementStats: {
    chatMessages: number;
    courseCompletions: number;
    mentorshipSessions: number;
    aiBotInteractions: number;
  };
}
