'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Users, 
  BookOpen, 
  MessageSquare, 
  Bot, 
  DollarSign,
  ArrowRight,
  Shield,
  Zap,
  Target
} from 'lucide-react';

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900">
      {/* Navigation */}
      <nav className="relative z-10 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-8 w-8 text-primary-600" />
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
              TradePro
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/auth/login')}
              className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              Login
            </button>
            <button
              onClick={() => router.push('/auth/signup')}
              className="btn-primary"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-20">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              Master Trading with
              <span className="text-primary-600"> Community</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
              Join thousands of traders in our comprehensive platform featuring real-time signals, 
              expert mentorship, AI-powered insights, and a thriving community.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => router.push('/auth/signup')}
                className="btn-primary text-lg px-8 py-4 flex items-center justify-center space-x-2"
              >
                <span>Start Trading Today</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => router.push('/features')}
                className="btn-secondary text-lg px-8 py-4"
              >
                Learn More
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-20 bg-white dark:bg-dark-800">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Comprehensive tools and resources for traders at every level
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center justify-center w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-lg mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-6 py-20 bg-primary-600">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-primary-100">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Transform Your Trading?
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Join our community today and start your journey to trading success
            </p>
            <button
              onClick={() => router.push('/auth/signup')}
              className="btn-primary text-lg px-8 py-4"
            >
              Get Started Now
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <TrendingUp className="h-6 w-6 text-primary-400" />
              <span className="text-xl font-bold">TradePro</span>
            </div>
            <div className="text-gray-400">
              © 2024 TradePro. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

const features = [
  {
    title: 'Real-Time Signals',
    description: 'Get instant access to professional trading signals with detailed analysis and risk management.',
    icon: Target,
  },
  {
    title: 'Expert Mentorship',
    description: 'Learn from experienced traders through 1-on-1 sessions and personalized guidance.',
    icon: Users,
  },
  {
    title: 'AI Trading Assistant',
    description: 'Powered by advanced AI to help you analyze markets and make informed decisions.',
    icon: Bot,
  },
  {
    title: 'Community Chat',
    description: 'Connect with fellow traders, share ideas, and discuss market opportunities.',
    icon: MessageSquare,
  },
  {
    title: 'Educational Courses',
    description: 'Comprehensive learning materials from beginner to advanced trading strategies.',
    icon: BookOpen,
  },
  {
    title: 'Funding Program',
    description: 'Access to funded trading accounts and capital allocation opportunities.',
    icon: DollarSign,
  },
];

const stats = [
  { value: '10K+', label: 'Active Traders' },
  { value: '95%', label: 'Success Rate' },
  { value: '$50M+', label: 'Capital Managed' },
  { value: '24/7', label: 'Support Available' },
];
