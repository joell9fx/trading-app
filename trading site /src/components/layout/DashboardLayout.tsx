'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  Home,
  Target,
  MessageSquare,
  BookOpen,
  Users,
  Bot,
  DollarSign,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Sun,
  Moon,
  User,
} from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    document.documentElement.classList.toggle('dark');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('Logged out successfully');
      router.push('/');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: Home },
    { name: 'Signals', href: '/dashboard/signals', icon: Target },
    { name: 'Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Courses', href: '/dashboard/courses', icon: BookOpen },
    { name: 'Mentorship', href: '/dashboard/mentorship', icon: Users },
    { name: 'AI Bot', href: '/dashboard/ai-bot', icon: Bot },
    { name: 'Funding', href: '/dashboard/funding', icon: DollarSign },
    ...(user?.role === 'admin' ? [{ name: 'Admin Panel', href: '/dashboard/admin', icon: Settings }] : []),
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-dark-800 shadow-lg lg:hidden"
          >
            <SidebarContent
              navigation={navigation}
              user={user}
              onLogout={handleLogout}
              onToggleDarkMode={toggleDarkMode}
              darkMode={darkMode}
              onClose={() => setSidebarOpen(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white dark:bg-dark-800 shadow-lg">
          <SidebarContent
            navigation={navigation}
            user={user}
            onLogout={handleLogout}
            onToggleDarkMode={toggleDarkMode}
            darkMode={darkMode}
          />
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-30 bg-white dark:bg-dark-800 shadow-sm border-b border-gray-200 dark:border-dark-700">
          <div className="flex items-center justify-between px-4 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                <Menu className="h-6 w-6" />
              </button>
              <div className="flex items-center space-x-2 ml-4 lg:ml-0">
                <TrendingUp className="h-6 w-6 text-primary-600" />
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  TradePro
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700"
              >
                {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </button>
              
              <button className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700 relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 bg-danger-500 rounded-full"></span>
              </button>

              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <User className="h-4 w-4 text-primary-600" />
                  )}
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {user.displayName}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user.membershipLevel}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

interface SidebarContentProps {
  navigation: Array<{
    name: string;
    href: string;
    icon: any;
  }>;
  user: any;
  onLogout: () => void;
  onToggleDarkMode: () => void;
  darkMode: boolean;
  onClose?: () => void;
}

function SidebarContent({
  navigation,
  user,
  onLogout,
  onToggleDarkMode,
  darkMode,
  onClose,
}: SidebarContentProps) {
  const router = useRouter();

  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-200 dark:border-dark-700">
        <div className="flex items-center space-x-2">
          <TrendingUp className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            TradePro
          </span>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="lg:hidden p-1 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-dark-700"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = router.pathname === item.href;
          return (
            <button
              key={item.name}
              onClick={() => {
                router.push(item.href);
                onClose?.();
              }}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-gray-200 dark:border-dark-700 px-4 py-4">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
            {user.photoURL ? (
              <img
                src={user.photoURL}
                alt={user.displayName}
                className="w-10 h-10 rounded-full"
              />
            ) : (
              <User className="h-5 w-5 text-primary-600" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {user.displayName}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {user.email}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <button
            onClick={() => {
              router.push('/dashboard/settings');
              onClose?.();
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
          
          <button
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-700 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
