'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import {
  AcademicCapIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  ArrowRightIcon,
  CommandLineIcon,
  BookOpenIcon,
  DocumentChartBarIcon,
  SparklesIcon,
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

const PRIMARY_SHORTCUTS: { id: string; label: string; icon: React.ComponentType<{ className?: string }>; section: string }[] = [
  { id: 'terminal', label: 'Command Center', icon: CommandLineIcon, section: 'terminal' },
  { id: 'signals', label: 'Signals', icon: ChartBarIcon, section: 'signals' },
  { id: 'journal', label: 'Growth Journal', icon: BookOpenIcon, section: 'journal' },
  { id: 'analytics', label: 'Analytics', icon: ChartBarIcon, section: 'analytics' },
  { id: 'ai-coach', label: 'AI Trade Coach', icon: SparklesIcon, section: 'ai-coach' },
  { id: 'reports', label: 'Reports', icon: DocumentChartBarIcon, section: 'reports' },
  { id: 'community-hub', label: 'Community', icon: ChatBubbleLeftRightIcon, section: 'community-hub' },
  { id: 'courses', label: 'Education', icon: AcademicCapIcon, section: 'courses' },
];

const SECONDARY_TOOLS: { label: string; section: string }[] = [
  { label: 'Consistency', section: 'consistency' },
  { label: 'Notifications', section: 'notifications' },
  { label: 'Funding', section: 'funding' },
  { label: 'Rewards Wallet', section: 'wallet' },
];

export default function DashboardOverview({ user, access, unlockedCount: unlockedCountProp, onCheckout }: DashboardOverviewProps) {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalCourses: 0,
    completedLessons: 0,
    communityPosts: 0,
    mentorshipSessions: 0,
    activeCourses: 0,
    journalEntries: 0,
    winRatePct: null as number | null,
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
        const [
          { count: totalCoursesCount },
          { count: completedLessonsCount },
          { count: postsCount },
          { count: communityPostsCount },
          { count: bookingsCount },
          { data: progressData },
          { count: journalCount },
          { data: journalRows },
        ] = await Promise.all([
          supabase.from('courses').select('*', { count: 'exact', head: true }).eq('is_published', true),
          supabase.from('progress').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('completed', true),
          supabase.from('posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('community_posts').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('bookings').select('*', { count: 'exact', head: true }).eq('user_id', user.id).in('status', ['pending', 'confirmed']),
          supabase.from('progress').select('lesson_id, completed').eq('user_id', user.id),
          supabase.from('journal_entries').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
          supabase.from('journal_entries').select('result_r').eq('user_id', user.id),
        ]);
        let activeCourses = 0;
        if (progressData?.length) {
          const lessonIds = progressData.map((p) => p.lesson_id);
          const { data: lessonsData } = await supabase.from('lessons').select('course_id').in('id', lessonIds);
          if (lessonsData) activeCourses = new Set(lessonsData.map((l) => l.course_id)).size;
        }
        let winRatePct: number | null = null;
        if (journalRows?.length) {
          const withR = journalRows.filter((r: { result_r: unknown }) => r.result_r != null && Number.isFinite(Number(r.result_r)));
          if (withR.length) {
            const wins = withR.filter((r: { result_r: unknown }) => Number(r.result_r) > 0).length;
            winRatePct = Math.round((wins / withR.length) * 100);
          }
        }
        setStats({
          totalCourses: totalCoursesCount ?? 0,
          completedLessons: completedLessonsCount ?? 0,
          communityPosts: (postsCount ?? 0) + (communityPostsCount ?? 0),
          mentorshipSessions: bookingsCount ?? 0,
          activeCourses,
          journalEntries: journalCount ?? 0,
          winRatePct,
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
        <div className="h-24 bg-panel rounded-xl" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-panel rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const userName = (user?.email ?? '').split('@')[0] || 'Trader';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  const signalsActive = Boolean(access?.signals);

  return (
    <div className="space-y-8">
      {/* Hero: status strip + primary CTA */}
      <div className="flex flex-col gap-4">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">{greeting}, {userName}</p>
        <div className="flex flex-wrap items-center gap-4 sm:gap-6 py-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Signals</span>
            <span className={`text-sm font-medium ${signalsActive ? 'text-primary' : 'text-muted-foreground'}`}>
              {signalsActive ? 'Active' : 'Locked'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Journal</span>
            <span className="text-sm font-medium text-foreground">{stats.journalEntries} entries</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Win rate</span>
            <span className="text-sm font-medium text-foreground">{stats.winRatePct != null ? `${stats.winRatePct}%` : '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Membership</span>
            <span className="text-sm font-medium text-primary">{tier ?? 'Member'}</span>
          </div>
        </div>
        <Button
          onClick={goTo('terminal')}
          className="w-full sm:w-auto shrink-0"
        >
          <CommandLineIcon className="h-5 w-5 mr-2" />
          Open Command Center
          <ArrowRightIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>

      {/* Primary shortcuts: 8 items */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">Quick access</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {PRIMARY_SHORTCUTS.map((s) => {
            const Icon = s.icon;
            return (
              <button
                key={s.id}
                type="button"
                onClick={goTo(s.section)}
                className="group flex items-center gap-3 p-3 rounded-lg bg-panel hover:bg-elevated border border-border-subtle hover:border-border transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary/20 focus:ring-offset-2 focus:ring-offset-background"
              >
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary shrink-0" />
                <span className="text-sm font-medium text-foreground truncate">{s.label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {SECONDARY_TOOLS.map((t) => (
            <button key={t.section} type="button" onClick={goTo(t.section)} className="text-muted-foreground hover:text-primary transition-colors">
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Membership + upgrade */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <MembershipCard tier={tier} />
        <NextUpgradeCard nextService={nextService} onCheckout={(key) => startCheckout(key)} />
      </div>

      {/* Services */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-3">Services</p>
        <div className="rounded-lg bg-panel p-4">
          <ServicesGrid services={ALL_SERVICES as never} unlocked={unlockedMap} onCheckout={() => openUpgrade()} />
        </div>
      </div>

      {/* Lightweight status row: no heavy cards */}
      <div className="flex flex-wrap gap-6 py-2 text-sm">
        <span className="text-muted-foreground">
          <span className="text-foreground font-medium">{resolvedUnlockedCount}</span> of 5 services
        </span>
        <span className="text-muted-foreground">
          <span className="text-foreground font-medium">{stats.activeCourses}</span> active courses · <span className="text-foreground font-medium">{stats.completedLessons}</span> lessons
        </span>
        <button type="button" onClick={goTo('community-hub')} className="text-primary hover:text-accent-hover font-medium">
          Community →
        </button>
      </div>

      {/* Updates */}
      <div>
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Updates</p>
        <ActivityFeed title="Member Updates" items={[]} />
      </div>
    </div>
  );
}
