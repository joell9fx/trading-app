'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Target,
  MessageSquare,
  BookOpen,
  DollarSign,
  Bot,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Clock,
  Star,
  Activity,
} from 'lucide-react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Signal, ChatMessage, Course } from '@/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentSignals, setRecentSignals] = useState<Signal[]>([]);
  const [recentMessages, setRecentMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentData = async () => {
      try {
        // Fetch recent signals
        const signalsQuery = query(
          collection(db, 'signals'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const signalsSnapshot = await getDocs(signalsQuery);
        const signals = signalsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Signal[];
        setRecentSignals(signals);

        // Fetch recent chat messages
        const messagesQuery = query(
          collection(db, 'chatMessages'),
          orderBy('createdAt', 'desc'),
          limit(5)
        );
        const messagesSnapshot = await getDocs(messagesQuery);
        const messages = messagesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ChatMessage[];
        setRecentMessages(messages);
      } catch (error) {
        console.error('Error fetching recent data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentData();
  }, []);

  const stats = [
    {
      name: 'Active Signals',
      value: '12',
      change: '+2.5%',
      changeType: 'positive',
      icon: Target,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900',
    },
    {
      name: 'Community Members',
      value: '1,234',
      change: '+12%',
      changeType: 'positive',
      icon: Users,
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900',
    },
    {
      name: 'Course Progress',
      value: '68%',
      change: '+5%',
      changeType: 'positive',
      icon: BookOpen,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100 dark:bg-warning-900',
    },
    {
      name: 'AI Interactions',
      value: '89',
      change: '+15%',
      changeType: 'positive',
      icon: Bot,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
  ];

  const quickActions = [
    {
      name: 'View Signals',
      description: 'Check latest trading opportunities',
      href: '/dashboard/signals',
      icon: Target,
      color: 'text-primary-600',
      bgColor: 'bg-primary-100 dark:bg-primary-900',
    },
    {
      name: 'Join Chat',
      description: 'Connect with the community',
      href: '/dashboard/chat',
      icon: MessageSquare,
      color: 'text-success-600',
      bgColor: 'bg-success-100 dark:bg-success-900',
    },
    {
      name: 'Start Learning',
      description: 'Access educational content',
      href: '/dashboard/courses',
      icon: BookOpen,
      color: 'text-warning-600',
      bgColor: 'bg-warning-100 dark:bg-warning-900',
    },
    {
      name: 'Book Mentorship',
      description: 'Schedule 1-on-1 sessions',
      href: '/dashboard/mentorship',
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {user?.displayName}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Here's what's happening in your trading community today.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => (
            <div key={stat.name} className="card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    {stat.value}
                  </p>
                  <div className="flex items-center mt-2">
                    {stat.changeType === 'positive' ? (
                      <ArrowUpRight className="h-4 w-4 text-success-600" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-danger-600" />
                    )}
                    <span className={`text-sm font-medium ml-1 ${
                      stat.changeType === 'positive' ? 'text-success-600' : 'text-danger-600'
                    }`}>
                      {stat.change}
                    </span>
                  </div>
                </div>
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <a
                key={action.name}
                href={action.href}
                className="card hover:shadow-lg transition-shadow duration-200 cursor-pointer"
              >
                <div className={`p-3 rounded-lg ${action.bgColor} w-fit mb-3`}>
                  <action.icon className={`h-6 w-6 ${action.color}`} />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                  {action.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {action.description}
                </p>
              </a>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Signals */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Signals
              </h3>
              <a
                href="/dashboard/signals"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                View all
              </a>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentSignals.length > 0 ? (
                recentSignals.map((signal) => (
                  <div key={signal.id} className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      signal.type === 'buy' ? 'bg-success-100 dark:bg-success-900' : 'bg-danger-100 dark:bg-danger-900'
                    }`}>
                      <TrendingUp className={`h-5 w-5 ${
                        signal.type === 'buy' ? 'text-success-600' : 'text-danger-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {signal.symbol} - {signal.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {signal.type.toUpperCase()} @ ${signal.entryPrice}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {signal.status}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(signal.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent signals
                </p>
              )}
            </div>
          </div>

          {/* Recent Chat Messages */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Recent Chat Activity
              </h3>
              <a
                href="/dashboard/chat"
                className="text-sm text-primary-600 hover:text-primary-500 font-medium"
              >
                View all
              </a>
            </div>
            <div className="space-y-4">
              {loading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-1"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentMessages.length > 0 ? (
                recentMessages.map((message) => (
                  <div key={message.id} className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {message.content.substring(0, 50)}...
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        #{message.channel}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(message.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                  No recent messages
                </p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Upcoming Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upcoming Events
          </h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-4 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
              <div className="p-2 bg-primary-100 dark:bg-primary-900 rounded-lg">
                <Calendar className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Weekly Market Analysis
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Join our expert analysis session
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Tomorrow
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  2:00 PM EST
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-4 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
              <div className="p-2 bg-warning-100 dark:bg-warning-900 rounded-lg">
                <Users className="h-5 w-5 text-warning-600" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">
                  Mentorship Session
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your scheduled 1-on-1 session
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Friday
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  10:00 AM EST
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
