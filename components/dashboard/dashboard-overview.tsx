'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  ClockIcon,
  FireIcon,
  BookOpenIcon,
  CpuChipIcon,
} from '@heroicons/react/24/outline';
import { useCheckout } from './use-checkout';
import { NextUpgradeCard } from './NextUpgradeCard';
import { ServicesGrid } from './ServicesGrid';
import { ALL_SERVICES, type ServiceKey } from '@/lib/services-list';
import { MembershipCard } from './MembershipCard';
import { MembershipTier, computeTier } from '@/lib/tier-utils';
import { ACCESS_DEFAULTS, countUnlocked, type AccessModuleKey } from '@/lib/access-flags';

interface DashboardOverviewProps {
  user: any;
  access?: Record<AccessModuleKey, boolean>;
  unlockedCount?: number;
  onCheckout?: (serviceKey: ServiceKey) => void;
}

export default function DashboardOverview({ user, access, unlockedCount: unlockedCountProp, onCheckout }: DashboardOverviewProps) {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    communityPosts: 0,
    mentorshipSessions: 0,
    activeCourses: 0,
  });
  const [loading, setLoading] = useState(true);
  const supabase = createSupabaseClient();
  const { handleCheckout } = useCheckout();
  const openUpgrade = () => router.push('/dashboard/upgrade');
  const startCheckout = onCheckout || ((key: ServiceKey) => handleCheckout(key));

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch user's profile data
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // Fetch total courses count
        const { count: totalCoursesCount } = await supabase
          .from('courses')
          .select('*', { count: 'exact', head: true })
          .eq('is_published', true);

        // Fetch completed lessons count from progress table
        const { count: completedLessonsCount } = await supabase
          .from('progress')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('completed', true);

        // Fetch community posts count (check both posts and community_posts tables)
        const { count: postsCount } = await supabase
          .from('posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        const { count: communityPostsCount } = await supabase
          .from('community_posts')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);

        // Fetch mentorship sessions count from bookings table
        const { count: bookingsCount } = await supabase
          .from('bookings')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .in('status', ['pending', 'confirmed']);

        // Fetch active courses (courses with progress but not completed)
        const { data: progressData } = await supabase
          .from('progress')
          .select('lesson_id, completed')
          .eq('user_id', user.id);

        // Get unique course IDs from lessons
        if (progressData && progressData.length > 0) {
          const lessonIds = progressData.map(p => p.lesson_id);
          const { data: lessonsData } = await supabase
            .from('lessons')
            .select('course_id')
            .in('id', lessonIds);

          if (lessonsData) {
            const uniqueCourseIds = Array.from(new Set(lessonsData.map(l => l.course_id)));
            // Count courses where user has progress but hasn't completed all lessons
            const activeCoursesCount = uniqueCourseIds.length;
            
            setStats({
              totalCourses: totalCoursesCount || 0,
              completedLessons: completedLessonsCount || 0,
              communityPosts: (postsCount || 0) + (communityPostsCount || 0),
              mentorshipSessions: bookingsCount || 0,
              activeCourses: activeCoursesCount,
            });
          } else {
            setStats({
              totalCourses: totalCoursesCount || 0,
              completedLessons: completedLessonsCount || 0,
              communityPosts: (postsCount || 0) + (communityPostsCount || 0),
              mentorshipSessions: bookingsCount || 0,
              activeCourses: 0,
            });
          }
        } else {
          setStats({
            totalCourses: totalCoursesCount || 0,
            completedLessons: completedLessonsCount || 0,
            communityPosts: (postsCount || 0) + (communityPostsCount || 0),
            mentorshipSessions: bookingsCount || 0,
            activeCourses: 0,
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to default values on error
        setStats({
          totalCourses: 0,
          completedLessons: 0,
          communityPosts: 0,
          mentorshipSessions: 0,
          activeCourses: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user.id, supabase]);

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-32 bg-gray-900 border border-gray-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-lg">
              <div className="h-4 bg-gray-800 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-gray-800 rounded w-1/3"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const userName = user.email?.split('@')[0] || 'Trader';
  const currentHour = new Date().getHours();
  const greeting = currentHour < 12 ? 'Good morning' : currentHour < 18 ? 'Good afternoon' : 'Good evening';

  const unlockedMap: Record<AccessModuleKey, boolean> = { ...ACCESS_DEFAULTS, ...(access || {}) };
  const totalCount = ALL_SERVICES.length;
  const resolvedUnlockedCount = typeof unlockedCountProp === 'number' ? unlockedCountProp : countUnlocked(unlockedMap);
  const tier: MembershipTier = (user?.membership_tier as MembershipTier) || computeTier(resolvedUnlockedCount);

  const nextService = (() => {
    // priority: none unlocked -> community, 1-2 -> signals, 3+ -> mentorship, else first locked
    const unlockedKeys = (Object.keys(unlockedMap) as AccessModuleKey[]).filter((k) => unlockedMap[k]);
    if (unlockedKeys.length === 0) {
      return ALL_SERVICES.find((s) => s.key === 'community') || null;
    }
    if (unlockedKeys.length <= 2) {
      return ALL_SERVICES.find((s) => s.key === 'signals' && !unlockedMap[s.key]) || ALL_SERVICES.find((s) => !unlockedMap[s.key]) || null;
    }
    if (unlockedKeys.length >= 3) {
      return ALL_SERVICES.find((s) => s.key === 'mentorship' && !unlockedMap[s.key]) || ALL_SERVICES.find((s) => !unlockedMap[s.key]) || null;
    }
    return ALL_SERVICES.find((s) => !unlockedMap[s.key]) || null;
  })();

  return (
    <div className="space-y-7">
      {/* Progress & Upsell */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <MembershipCard tier={tier} />
        <NextUpgradeCard nextService={nextService} onCheckout={(key) => startCheckout(key)} />
      </div>

      {/* Services Grid */}
      <div className="rounded-2xl border border-white/8 bg-white/5 p-4 sm:p-6">
        <ServicesGrid services={ALL_SERVICES as any} unlocked={unlockedMap} onCheckout={(_key) => openUpgrade()} />
      </div>

      {/* Hero Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0f1624] p-8 text-white shadow-[0_20px_50px_-35px_rgba(0,0,0,0.85)]">
        <div className="flex flex-col lg:flex-row items-start justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 border border-white/15 text-gray-200">
              {greeting}, {userName}
            </span>
            <h1 className="text-3xl lg:text-4xl font-semibold leading-tight">
              Welcome back to your trading desk 👋
            </h1>
            <p className="text-gray-300">
              Continue your journey, unlock services, and keep your edge sharp with curated actions below.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
            <Button
              onClick={() => router.push('/dashboard?section=learning-path')}
              className="bg-gold-500 hover:bg-gold-400 text-black"
            >
              View learning path
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard?section=notifications')}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Check notifications
              </Button>
            </div>
          </div>
          <div className="hidden lg:flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 p-4">
            <div className="w-20 h-20 rounded-full bg-gold-500/15 flex items-center justify-center">
              <ChartBarIcon className="w-10 h-10 text-gold-300" />
            </div>
          </div>
        </div>
      </div>

      {/* Status Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white/5 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-[0.18em] text-gray-400">Membership</span>
            <span className="px-2 py-1 text-[11px] rounded-full bg-gold-500/15 border border-gold-500/25 text-gold-200">
              {tier || 'Member'}
            </span>
          </div>
          <p className="text-sm text-gray-300">Access level: {tier === 'Elite' ? 'Full access' : 'Core member'}</p>
        </Card>

        <Card className="bg-white/5 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-[0.18em] text-gray-400">Unlocked</span>
            <span className="px-2 py-1 text-[11px] rounded-full bg-white/10 border border-white/15 text-gray-100">
              {resolvedUnlockedCount || 0} / 5
            </span>
          </div>
          <p className="text-sm text-gray-300">
            {resolvedUnlockedCount && resolvedUnlockedCount >= 4 ? 'Almost everything is open.' : 'Upgrade to unlock more services.'}
          </p>
        </Card>

        <Card className="bg-white/5 border border-white/10 p-4 sm:p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs uppercase tracking-[0.18em] text-gray-400">Auto Trader</span>
            <span className={`px-2 py-1 text-[11px] rounded-full ${access?.auto_trader ? 'bg-emerald-500/15 border border-emerald-400/30 text-emerald-200' : 'bg-white/10 border border-white/15 text-gray-100'}`}>
              {access?.auto_trader ? 'Unlocked' : 'Locked'}
            </span>
          </div>
          <p className="text-sm text-gray-300">
            {access?.auto_trader ? 'Setup is ready inside Auto Trader.' : 'Locked—unlock to configure automation.'}
          </p>
        </Card>
      </div>

      {/* Stats Grid - Redesigned */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white/5 border border-white/10 hover:border-gold-400/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all cursor-pointer group">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/15 border border-gold-500/25 rounded-xl">
                <AcademicCapIcon className="w-6 h-6 text-gold-300" />
              </div>
              <span className="text-xs font-semibold text-gold-200 bg-gold-500/15 border border-gold-500/25 px-2 py-1 rounded-full">
                Active
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Active Courses</p>
            <p className="text-3xl font-bold text-white">{stats.activeCourses}</p>
            <p className="text-xs text-gray-500 mt-2">of {stats.totalCourses} total</p>
          </div>
        </Card>

        <Card className="bg-white/5 border border-white/10 hover:border-gold-400/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all cursor-pointer group">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/15 border border-gold-500/25 rounded-xl">
                <BookOpenIcon className="w-6 h-6 text-gold-300" />
              </div>
              <span className="text-xs font-semibold text-gold-200 bg-gold-500/15 border border-gold-500/25 px-2 py-1 rounded-full">
                {Math.round((stats.completedLessons / (stats.totalCourses * 5)) * 100)}%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Completed Lessons</p>
            <p className="text-3xl font-bold text-white">{stats.completedLessons}</p>
            <p className="text-xs text-gray-500 mt-2">Keep it up!</p>
          </div>
        </Card>

        <Card className="bg-white/5 border border-white/10 hover:border-gold-400/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all cursor-pointer group">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/15 border border-gold-500/25 rounded-xl">
                <UserGroupIcon className="w-6 h-6 text-gold-300" />
              </div>
              <span className="text-xs font-semibold text-gold-200 bg-gold-500/15 border border-gold-500/25 px-2 py-1 rounded-full">
                <FireIcon className="w-3 h-3 inline" /> Active
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Community Posts</p>
            <p className="text-3xl font-bold text-white">{stats.communityPosts}</p>
            <p className="text-xs text-gray-500 mt-2">Engage more!</p>
          </div>
        </Card>

        <Card className="bg-white/5 border border-white/10 hover:border-gold-400/50 hover:shadow-lg hover:shadow-gold-500/10 transition-all cursor-pointer group">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gold-500/15 border border-gold-500/25 rounded-xl">
                <ChatBubbleLeftRightIcon className="w-6 h-6 text-gold-300" />
              </div>
              <span className="text-xs font-semibold text-gold-200 bg-gold-500/15 border border-gold-500/25 px-2 py-1 rounded-full">
                <ClockIcon className="w-3 h-3 inline" /> Scheduled
              </span>
            </div>
            <p className="text-sm font-medium text-gray-400 mb-1">Mentorship Sessions</p>
            <p className="text-3xl font-bold text-white">{stats.mentorshipSessions}</p>
            <p className="text-xs text-gray-500 mt-2">Book more sessions</p>
          </div>
        </Card>
      </div>

      {/* Quick Actions - Redesigned */}
      <div className="grid grid-cols-1 gap-4 sm:gap-6">
        <Card className="p-6 bg-white/5 border border-white/10 hover:border-gold-400/50 transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">Momentum</p>
              <h2 className="text-xl font-semibold text-white">Quick Actions</h2>
            </div>
            <ArrowRightIcon className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            <button
              onClick={() => router.push('/dashboard?section=courses')}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-gold-400/40 hover:bg-white/10 transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-500/15 border border-gold-500/20 rounded-lg">
                  <AcademicCapIcon className="w-5 h-5 text-gold-300" />
                </div>
                <span className="font-semibold text-white">Browse Courses</span>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gold-300 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => router.push('/community-hub')}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-gold-400/40 hover:bg-white/10 transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-500/15 border border-gold-500/20 rounded-lg">
                  <UserGroupIcon className="w-5 h-5 text-gold-300" />
                </div>
                <span className="font-semibold text-white">Join Community</span>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gold-300 group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button
              onClick={() => router.push('/dashboard?section=mentorship')}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-gold-400/40 hover:bg-white/10 transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-500/15 border border-gold-500/20 rounded-lg">
                  <ChatBubbleLeftRightIcon className="w-5 h-5 text-gold-300" />
                </div>
                <span className="font-semibold text-white">Book Mentorship</span>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gold-300 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => router.push('/dashboard/auto-trader')}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-gold-400/40 hover:bg-white/10 transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-500/15 border border-gold-500/20 rounded-lg">
                  <CpuChipIcon className="w-5 h-5 text-gold-300" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Auto Trader</span>
                  <span className="text-xs text-gray-400">Automation overview & setup</span>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gold-300 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => router.push('/dashboard/gold-to-glory')}
              className="w-full flex items-center justify-between p-4 bg-white/5 border border-white/10 rounded-xl hover:border-gold-400/40 hover:bg-white/10 transition-all group text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0a0f1c]"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gold-500/15 border border-gold-500/20 rounded-lg">
                  <CpuChipIcon className="w-5 h-5 text-gold-300" />
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-white">Gold to Glory (G2G)</span>
                  <span className="text-xs text-gray-400">100 → 1000 Challenge</span>
                </div>
              </div>
              <ArrowRightIcon className="w-5 h-5 text-gold-300 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </Card>

        {/* Recent Activity / Featured Section */}
        <Card className="p-6 bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-gray-400 mb-1">Consistency</p>
              <h2 className="text-xl font-semibold text-white">Your Progress</h2>
            </div>
            <div className="w-12 h-12 bg-gold-500/15 border border-gold-500/25 rounded-full flex items-center justify-center">
              <ChartBarIcon className="w-6 h-6 text-gold-300" />
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gold-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">Learning streak</span>
              </div>
              <span className="text-sm font-semibold text-white">3 days</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-gold-300 rounded-full"></div>
                <span className="text-sm font-medium text-gray-300">This week's goal</span>
              </div>
              <span className="text-sm font-semibold text-white">5 lessons</span>
            </div>
            <div className="pt-4 border-t border-white/10">
              <Link href="/courses">
                <Button className="w-full bg-gold-500 hover:bg-gold-400 text-black">
                  View All Courses
                  <ArrowRightIcon className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

