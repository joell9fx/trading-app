import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  arrayUnion,
  arrayRemove,
  increment,
} from 'firebase/firestore';
import { db } from './firebase';
import {
  User,
  Signal,
  Comment,
  ChatMessage,
  Course,
  Module,
  Lesson,
  MentorshipSession,
  FundingApplication,
  Notification,
  AIBotMessage,
  Analytics,
  DashboardStats,
} from '../types';

// ============================================================================
// USER SERVICES
// ============================================================================

export const userService = {
  // Create a new user
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'lastLoginAt'>): Promise<string> {
    const userRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    });
    return userRef.id;
  },

  // Get user by ID
  async getUserById(userId: string): Promise<User | null> {
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }
    return null;
  },

  // Get user by email
  async getUserByEmail(email: string): Promise<User | null> {
    const q = query(collection(db, 'users'), where('email', '==', email));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return { id: doc.id, ...doc.data() } as User;
    }
    return null;
  },

  // Update user
  async updateUser(userId: string, updates: Partial<User>): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Update last login
  async updateLastLogin(userId: string): Promise<void> {
    await updateDoc(doc(db, 'users', userId), {
      lastLoginAt: serverTimestamp(),
    });
  },

  // Get all users (with pagination)
  async getUsers(limitCount: number = 20, lastUser?: User): Promise<User[]> {
    let q = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    if (lastUser) {
      q = query(q, startAfter(lastUser.createdAt));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as User);
  },

  // Listen to user changes
  onUserChange(userId: string, callback: (user: User | null) => void) {
    return onSnapshot(doc(db, 'users', userId), (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() } as User);
      } else {
        callback(null);
      }
    });
  },
};

// ============================================================================
// SIGNAL SERVICES
// ============================================================================

export const signalService = {
  // Create a new signal
  async createSignal(signalData: Omit<Signal, 'id' | 'createdAt' | 'likes' | 'comments'>): Promise<string> {
    const signalRef = await addDoc(collection(db, 'signals'), {
      ...signalData,
      likes: [],
      comments: [],
      createdAt: serverTimestamp(),
    });
    return signalRef.id;
  },

  // Get signal by ID
  async getSignalById(signalId: string): Promise<Signal | null> {
    const signalDoc = await getDoc(doc(db, 'signals', signalId));
    if (signalDoc.exists()) {
      return { id: signalDoc.id, ...signalDoc.data() } as Signal;
    }
    return null;
  },

  // Get all signals (with filters)
  async getSignals(filters?: {
    status?: Signal['status'];
    market?: Signal['market'];
    type?: Signal['type'];
    limit?: number;
  }): Promise<Signal[]> {
    let q = query(collection(db, 'signals'), orderBy('createdAt', 'desc'));

    if (filters?.status) {
      q = query(q, where('status', '==', filters.status));
    }
    if (filters?.market) {
      q = query(q, where('market', '==', filters.market));
    }
    if (filters?.type) {
      q = query(q, where('type', '==', filters.type));
    }
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Signal);
  },

  // Update signal
  async updateSignal(signalId: string, updates: Partial<Signal>): Promise<void> {
    await updateDoc(doc(db, 'signals', signalId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  },

  // Delete signal
  async deleteSignal(signalId: string): Promise<void> {
    await deleteDoc(doc(db, 'signals', signalId));
  },

  // Toggle like on signal
  async toggleLike(signalId: string, userId: string): Promise<void> {
    const signalRef = doc(db, 'signals', signalId);
    const signalDoc = await getDoc(signalRef);
    
    if (signalDoc.exists()) {
      const signal = signalDoc.data() as Signal;
      const likes = signal.likes || [];
      
      if (likes.includes(userId)) {
        await updateDoc(signalRef, {
          likes: arrayRemove(userId),
        });
      } else {
        await updateDoc(signalRef, {
          likes: arrayUnion(userId),
        });
      }
    }
  },

  // Add comment to signal
  async addComment(signalId: string, comment: Omit<Comment, 'id' | 'createdAt'>): Promise<void> {
    const signalRef = doc(db, 'signals', signalId);
    const newComment = {
      ...comment,
      id: Date.now().toString(),
      createdAt: serverTimestamp(),
      likes: [],
      replies: [],
    };

    await updateDoc(signalRef, {
      comments: arrayUnion(newComment),
    });
  },

  // Listen to signals
  onSignalsChange(callback: (signals: Signal[]) => void) {
    const q = query(collection(db, 'signals'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (querySnapshot) => {
      const signals = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Signal);
      callback(signals);
    });
  },
};

// ============================================================================
// CHAT SERVICES
// ============================================================================

export const chatService = {
  // Send a message
  async sendMessage(messageData: Omit<ChatMessage, 'id' | 'createdAt' | 'reactions'>): Promise<string> {
    const messageRef = await addDoc(collection(db, 'chat_messages'), {
      ...messageData,
      reactions: [],
      createdAt: serverTimestamp(),
    });
    return messageRef.id;
  },

  // Get messages by channel
  async getMessagesByChannel(channel: ChatMessage['channel'], limitCount: number = 50): Promise<ChatMessage[]> {
    const q = query(
      collection(db, 'chat_messages'),
      where('channel', '==', channel),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ChatMessage);
  },

  // Listen to channel messages
  onChannelMessages(channel: ChatMessage['channel'], callback: (messages: ChatMessage[]) => void) {
    const q = query(
      collection(db, 'chat_messages'),
      where('channel', '==', channel),
      orderBy('createdAt', 'desc'),
      limit(100)
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as ChatMessage);
      callback(messages);
    });
  },

  // Add reaction to message
  async addReaction(messageId: string, emoji: string, userId: string): Promise<void> {
    const messageRef = doc(db, 'chat_messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (messageDoc.exists()) {
      const message = messageDoc.data() as ChatMessage;
      const reactions = message.reactions || [];
      
      const existingReaction = reactions.find(r => r.emoji === emoji);
      if (existingReaction) {
        if (!existingReaction.users.includes(userId)) {
          existingReaction.users.push(userId);
        }
      } else {
        reactions.push({ emoji, users: [userId] });
      }
      
      await updateDoc(messageRef, { reactions });
    }
  },

  // Delete message
  async deleteMessage(messageId: string): Promise<void> {
    await deleteDoc(doc(db, 'chat_messages', messageId));
  },
};

// ============================================================================
// COURSE SERVICES
// ============================================================================

export const courseService = {
  // Create a new course
  async createCourse(courseData: Omit<Course, 'id' | 'createdAt' | 'updatedAt' | 'enrolledUsers'>): Promise<string> {
    const courseRef = await addDoc(collection(db, 'courses'), {
      ...courseData,
      enrolledUsers: [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return courseRef.id;
  },

  // Get course by ID
  async getCourseById(courseId: string): Promise<Course | null> {
    const courseDoc = await getDoc(doc(db, 'courses', courseId));
    if (courseDoc.exists()) {
      return { id: courseDoc.id, ...courseDoc.data() } as Course;
    }
    return null;
  },

  // Get all published courses
  async getPublishedCourses(): Promise<Course[]> {
    const q = query(
      collection(db, 'courses'),
      where('isPublished', '==', true),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Course);
  },

  // Enroll user in course
  async enrollUser(courseId: string, userId: string): Promise<void> {
    await updateDoc(doc(db, 'courses', courseId), {
      enrolledUsers: arrayUnion(userId),
    });
  },

  // Update course progress
  async updateLessonProgress(courseId: string, moduleId: string, lessonId: string, userId: string): Promise<void> {
    const progressRef = doc(db, 'course_progress', `${userId}_${courseId}`);
    await updateDoc(progressRef, {
      [`modules.${moduleId}.lessons.${lessonId}.completed`]: true,
      [`modules.${moduleId}.lessons.${lessonId}.completedAt`]: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },

  // Get user's course progress
  async getUserCourseProgress(courseId: string, userId: string): Promise<any> {
    const progressDoc = await getDoc(doc(db, 'course_progress', `${userId}_${courseId}`));
    if (progressDoc.exists()) {
      return progressDoc.data();
    }
    return null;
  },
};

// ============================================================================
// MENTORSHIP SERVICES
// ============================================================================

export const mentorshipService = {
  // Create mentorship session
  async createSession(sessionData: Omit<MentorshipSession, 'id'>): Promise<string> {
    const sessionRef = await addDoc(collection(db, 'mentorship_sessions'), {
      ...sessionData,
      createdAt: serverTimestamp(),
    });
    return sessionRef.id;
  },

  // Get session by ID
  async getSessionById(sessionId: string): Promise<MentorshipSession | null> {
    const sessionDoc = await getDoc(doc(db, 'mentorship_sessions', sessionId));
    if (sessionDoc.exists()) {
      return { id: sessionDoc.id, ...sessionDoc.data() } as MentorshipSession;
    }
    return null;
  },

  // Get user's sessions
  async getUserSessions(userId: string, role: 'mentor' | 'mentee'): Promise<MentorshipSession[]> {
    const field = role === 'mentor' ? 'mentorId' : 'menteeId';
    const q = query(
      collection(db, 'mentorship_sessions'),
      where(field, '==', userId),
      orderBy('scheduledAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as MentorshipSession);
  },

  // Update session status
  async updateSessionStatus(sessionId: string, status: MentorshipSession['status']): Promise<void> {
    await updateDoc(doc(db, 'mentorship_sessions', sessionId), {
      status,
      updatedAt: serverTimestamp(),
    });
  },

  // Add session notes
  async addSessionNotes(sessionId: string, notes: string): Promise<void> {
    await updateDoc(doc(db, 'mentorship_sessions', sessionId), {
      notes,
      updatedAt: serverTimestamp(),
    });
  },
};

// ============================================================================
// FUNDING APPLICATION SERVICES
// ============================================================================

export const fundingService = {
  // Submit funding application
  async submitApplication(applicationData: Omit<FundingApplication, 'id' | 'submittedAt'>): Promise<string> {
    const applicationRef = await addDoc(collection(db, 'funding_applications'), {
      ...applicationData,
      submittedAt: serverTimestamp(),
    });
    return applicationRef.id;
  },

  // Get application by ID
  async getApplicationById(applicationId: string): Promise<FundingApplication | null> {
    const applicationDoc = await getDoc(doc(db, 'funding_applications', applicationId));
    if (applicationDoc.exists()) {
      return { id: applicationDoc.id, ...applicationDoc.data() } as FundingApplication;
    }
    return null;
  },

  // Get user's applications
  async getUserApplications(userId: string): Promise<FundingApplication[]> {
    const q = query(
      collection(db, 'funding_applications'),
      where('userId', '==', userId),
      orderBy('submittedAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as FundingApplication);
  },

  // Update application status
  async updateApplicationStatus(applicationId: string, status: FundingApplication['status'], reviewerId?: string): Promise<void> {
    await updateDoc(doc(db, 'funding_applications', applicationId), {
      status,
      reviewerId,
      reviewedAt: serverTimestamp(),
    });
  },

  // Add evaluation results
  async addEvaluationResults(applicationId: string, results: FundingApplication['evaluationResults']): Promise<void> {
    await updateDoc(doc(db, 'funding_applications', applicationId), {
      evaluationResults: results,
      updatedAt: serverTimestamp(),
    });
  },
};

// ============================================================================
// NOTIFICATION SERVICES
// ============================================================================

export const notificationService = {
  // Create notification
  async createNotification(notificationData: Omit<Notification, 'id' | 'createdAt'>): Promise<string> {
    const notificationRef = await addDoc(collection(db, 'notifications'), {
      ...notificationData,
      createdAt: serverTimestamp(),
    });
    return notificationRef.id;
  },

  // Get user notifications
  async getUserNotifications(userId: string, limitCount: number = 20): Promise<Notification[]> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Notification);
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, 'notifications', notificationId), {
      isRead: true,
    });
  },

  // Mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);
    const batch = writeBatch(db);

    querySnapshot.docs.forEach((doc) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
  },

  // Listen to user notifications
  onUserNotifications(userId: string, callback: (notifications: Notification[]) => void) {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    return onSnapshot(q, (querySnapshot) => {
      const notifications = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Notification);
      callback(notifications);
    });
  },
};

// ============================================================================
// AI BOT SERVICES
// ============================================================================

export const aiBotService = {
  // Save AI conversation
  async saveConversation(conversationData: Omit<AIBotMessage, 'id' | 'createdAt'>): Promise<string> {
    const conversationRef = await addDoc(collection(db, 'ai_conversations'), {
      ...conversationData,
      createdAt: serverTimestamp(),
    });
    return conversationRef.id;
  },

  // Get user's AI conversations
  async getUserConversations(userId: string, limitCount: number = 50): Promise<AIBotMessage[]> {
    const q = query(
      collection(db, 'ai_conversations'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AIBotMessage);
  },

  // Get conversations by context
  async getConversationsByContext(context: AIBotMessage['context'], limitCount: number = 20): Promise<AIBotMessage[]> {
    const q = query(
      collection(db, 'ai_conversations'),
      where('context', '==', context),
      orderBy('createdAt', 'desc'),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }) as AIBotMessage);
  },
};

// ============================================================================
// ANALYTICS SERVICES
// ============================================================================

export const analyticsService = {
  // Get dashboard statistics
  async getDashboardStats(): Promise<DashboardStats> {
    // This would typically aggregate data from multiple collections
    // For now, we'll return a basic structure
    const stats: DashboardStats = {
      userStats: {
        totalMembers: 0,
        newMembersThisMonth: 0,
        activeMembers: 0,
      },
      tradingStats: {
        totalSignals: 0,
        activeSignals: 0,
        successRate: 0,
        totalProfit: 0,
      },
      engagementStats: {
        chatMessages: 0,
        courseCompletions: 0,
        mentorshipSessions: 0,
        aiBotInteractions: 0,
      },
    };

    // Get user stats
    const usersSnapshot = await getDocs(collection(db, 'users'));
    stats.userStats.totalMembers = usersSnapshot.size;

    // Get signal stats
    const signalsSnapshot = await getDocs(collection(db, 'signals'));
    stats.tradingStats.totalSignals = signalsSnapshot.size;

    const activeSignalsSnapshot = await getDocs(
      query(collection(db, 'signals'), where('status', '==', 'active'))
    );
    stats.tradingStats.activeSignals = activeSignalsSnapshot.size;

    // Get chat stats
    const chatSnapshot = await getDocs(collection(db, 'chat_messages'));
    stats.engagementStats.chatMessages = chatSnapshot.size;

    // Get AI bot stats
    const aiSnapshot = await getDocs(collection(db, 'ai_conversations'));
    stats.engagementStats.aiBotInteractions = aiSnapshot.size;

    return stats;
  },

  // Update analytics (called periodically)
  async updateAnalytics(): Promise<void> {
    const stats = await this.getDashboardStats();
    await updateDoc(doc(db, 'analytics', 'dashboard'), {
      ...stats,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  },
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export const firebaseUtils = {
  // Convert Firestore timestamp to Date
  timestampToDate(timestamp: Timestamp): Date {
    return timestamp.toDate();
  },

  // Convert Date to Firestore timestamp
  dateToTimestamp(date: Date): Timestamp {
    return Timestamp.fromDate(date);
  },

  // Generate a unique ID
  generateId(): string {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  },

  // Batch operations
  async batchOperation(operations: (() => Promise<void>)[]): Promise<void> {
    const batch = writeBatch(db);
    
    for (const operation of operations) {
      await operation();
    }
    
    await batch.commit();
  },
};
