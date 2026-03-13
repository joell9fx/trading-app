'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  AcademicCapIcon,
  ChartBarIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CommandLineIcon,
  BookOpenIcon,
  DocumentChartBarIcon,
  SparklesIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  BellIcon,
  WalletIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline';
import { useCheckout } from './use-checkout';
import { NextUpgradeCard } from './NextUpgradeCard';
import { ServicesGrid } from './ServicesGrid';
import { ActivityFeed } from './activity-feed';
import { ALL_SERVICES, type ServiceKey } from '@/lib/services-list';
import { MembershipCard } from './MembershipCard';
import { MembershipTier, computeTier } from '@/lib/tier-utils';
import { ACCESS_DEFAULTS, countUnlocked, type AccessModuleKey } from '@/lib/access-flags';

interface DashboardOverviewProps {
  user: { email?: string; id?: string; [key: string]: unknown };
  access?: Record<AccessModuleKey, boolean>;
  unlockedCount?: number;
  onCheckout?: (serviceKey: ServiceKey) => void;
}

const SHORTCUTS: { id: string; label: string; description: string; icon: React.ComponentType<{ className?: string }>; section: string }[] = [
  { id: 'terminal', label: 'Command Center', description: 'Unified performance & focus', icon: CommandLineIcon, section: 'terminal' },
  { id: 'journal', label: 'Growth Journal', description: 'Log & review trades', icon: BookOpenIcon, section: 'journal' },
  { id: 'analytics', label: 'Analytics', description: 'Charts & metrics', icon: ChartBarIcon, section: 'analytics' },
  { id: 'ai-coach', label: 'AI Trade Coach', description: 'Insights & next actions', icon: SparklesIcon, section: 'ai-coach' },
  { id: 'reports', label: 'Reports', description: 'Saved snapshots', icon: DocumentChartBarIcon, section: 'reports' },
  { id: 'consistency', label: 'Consistency', description: 'Discipline scores', icon: ClipboardDocumentCheckIcon, section: 'consistency' },
  { id: 'community-hub', label: 'Community', description: 'Discuss & share', icon: ChatBubbleLeftRightIcon, section: 'community-hub' },
  { id: 'courses', label: 'Education', description: 'Courses & lessons', icon: AcademicCapIcon, section: 'courses' },
  { id: 'signals', label: 'Signals', description: 'Trading setups', icon: ChartBarIcon, section: 'signals' },
  { id: 'notifications', label: 'Notifications', description: 'Updates & alerts', icon: BellIcon, section: 'notifications' },
  { id: 'funding', label: 'Funding', description: 'Prop accounts', icon: CurrencyDollarIcon, section: 'funding' },
  { id: 'wallet', label: 'Rewards', description: 'Wallet & points', icon: WalletIcon, section: 'wallet' },
];

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
  const supabase = useMemo(() => createSupabaseClient(), []);
  const { handleCheckout } = useCheckout();
  const openUpgrade = () => router.push('/dashboard/upgrade');
  const startCheckout = onCheckout || ((key: ServiceKey) => handleCheckout(key));

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    const fetchStats = async () => {
      try {
        const [{ count: totalCoursesCount }, { count: completedLessonsCount }, { count: postsCount }, { count: communityPostsCount }, { count: bookingsCount }, { data: progressData }] = await Promise.all([
          supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['pending', 'confirmed']),
          supabase.from('progress').select('lesson_id, completed').eq('user_id', user.id),
        ]);
        let activeCourses = 0;
        if (progressData?.length) {
          const lessonIds = progressData.map((p) => p.lesson_id);
          const { data: lessonsData } = await supabase.from('lessons').select('course_id').in('id', lessonIds);
          if (lessonsData) activeCourses = new Set(lessonsData.map((l) => l.course_id)).size;
        }
        setStats({
          totalCourses: totalCoursesCount ?? 0,
          completedLessons: completedLessonsCount ?? 0,
          communityPosts: (postsCount ?? 0) + (communityPostsCount ?? 0),
          mentorshipSessions: bookingsCount ?? 0,
          activeCourses,
        });
      } catch (e) {
        console.error('Overview stats', e);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user?.id, supabase]);

  const unlockedMap: Record<AccessModuleKey, boolean> = useMemo(() => ({ ...ACCESS_DEFAULTS, ...(access || {}) }), [access]);
  const resolvedUnlockedCount = typeof unlockedCountProp === 'number' ? unlockedCountProp : countUnlocked(unlockedMap);
  const tier: MembershipTier = (user?.membership_tier as MembershipTier) || computeTier(resolvedUnlockedCount);
  const nextService = useMemo(() => {
    const unlockedKeys = (Object.keys(unlockedMap) as AccessModuleKey[]).filter((k) => unlockedMap[k]);
    if (unlockedKeys.length === 0) return ALL_SERVICES.find((s) => s.key === 'community') ?? null;
    if (unlockedKeys.length <= 2) return ALL_SERVICES.find((s) => s.key === 'signals' && !unlockedMap[s.key]) ?? ALL_SERVICES.find((s) => !unlockedMap[s.key]) ?? null;
    if (unlockedKeys.length >= 3) return ALL_SERVICES.find((s) => s.key === 'mentorship' && !unlockedMap[s.key]) ?? ALL_SERVICES.find((s) => !unlockedMap[s.key]) ?? null;
    return ALL_SERVICES.find((s) => !unlockedMap[s.key]) ?? null;
  }, [unlockedMap]);

  const goTo = (section: string) => () => router.push(`/dashboard?section=${section}`);

  if (loading) {
    return (
      <div className="animate-pulse space-y-8">
        <div className="h-24 bg-white/[0.04] rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-white/[0.04] rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const userName = (user?.email ?? '').split('@')[0] || 'Trader';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-8">
      {/* Hero: greeting + primary CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1">{greeting}, {userName}</p>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Control Centre</h1>
          <p className="mt-1 text-sm text-gray-400 max-w-md">Your daily hub for performance, journal, and next actions.</p>
        </div>
        <Button
          onClick={goTo('terminal')}
          className="shrink-0 bg-amber-500 hover:bg-amber-400 text-black font-semibold border-0 shadow-lg shadow-amber-500/20"
        >
          <CommandLineIcon className="h-5 w-5 mr-2" />
          Open Command Center
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Shortcuts grid */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Quick access</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={goTo(s.section)}
                className="group flex items-start gap-3 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all text-left focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:ring-offset-2 focus:ring-offset-[#0a0e14]"
              >
                <div className="p-2 rounded-lg bg-white/[0.06] group-hover:bg-amber-500/10 border border-white/[0.06] group-hover:border-amber-400/20 transition-colors">
                  <Icon className="h-5 w-5 text-gray-400 group-hover:text-amber-400/90" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-white truncate">{s.label}</p>
                  <p className="text-xs text-gray-500 truncate">{s.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Membership + upgrade: compact row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MembershipCard tier={tier} />
        <NextUpgradeCard nextService={nextService} onCheckout={(key) => startCheckout(key)} />
      </div>

      {/* Services grid: unlock more */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Services</p>
        <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 sm:p-5">
          <ServicesGrid services={ALL_SERVICES as never} unlocked={unlockedMap} onCheckout={() => openUpgrade()} />
        </div>
      </div>

      {/* Status + activity row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 border-white/[0.06] bg-white/[0.02] rounded-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Membership</p>
          <p className="text-sm font-medium text-white">{tier === 'Elite' ? 'Full access' : 'Core member'}</p>
          <p className="text-xs text-gray-500 mt-0.5">{resolvedUnlockedCount} of 5 services unlocked</p>
        </Card>
        <Card className="p-4 border-white/[0.06] bg-white/[0.02] rounded-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Learning</p>
          <p className="text-sm font-medium text-white">{stats.activeCourses} active · {stats.completedLessons} lessons done</p>
          <button type="button" onClick={goTo('courses')} className="text-xs text-amber-400/90 hover:text-amber-300 mt-1 font-medium">
            View education →
          </button>
        </Card>
        <Card className="p-4 border-white/[0.06] bg-white/[0.02] rounded-xl">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-2">Activity</p>
          <p className="text-sm font-medium text-white">{stats.communityPosts} posts · {stats.mentorshipSessions} sessions</p>
          <button type="button" onClick={goTo('community-hub')} className="text-xs text-amber-400/90 hover:text-amber-300 mt-1 font-medium">
            Community →
          </button>
        </Card>
      </div>

      {/* Member updates / activity feed */}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Updates</p>
        <ActivityFeed title="Member Updates" items={[]} />
      </div>
    </div>
  );
}
