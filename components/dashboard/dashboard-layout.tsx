'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';
import DashboardSidebar from './dashboard-sidebar';
import DashboardHeader from './dashboard-header';
import DashboardOverview from './dashboard-overview';
import { SignalsSection } from './signals-section';
import { CoursesSection } from './courses-section';
import { MentorshipSection } from './mentorship-section';
import { ProfileSection } from './profile-section';
import { AIAssistant } from './ai-assistant';
import { FundingAccountSection } from './funding-account-section';
import { usePermissions } from '@/hooks/use-permissions';
import { hasPermission, UserRole } from '@/lib/permissions';
import CommunityHub from '../community-hub/community-hub';
import { NotificationsPanel } from './notifications-panel';
import { useUserNotifications } from './use-user-notifications';
import { useToast } from '@/hooks/use-toast';
import { useUserServices } from './use-user-services';
import { LockedFeature } from './locked-feature';
import { useCheckout } from './use-checkout';
import { WalletView } from './wallet-view';
import { LeaderboardView } from './leaderboard-view';
import { LearningPathList } from './learning-path-list';
import AutoTraderSection from './auto-trader-section';
import { MentorChat } from './mentor-chat';
import { GoldToGlory } from './gold-to-glory';
import {
  HomeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  UserIcon,
  ShieldCheckIcon,
  CommandLineIcon,
} from '@heroicons/react/24/outline';
import { AdminHub } from './admin/admin-hub';
import { RoleProvider, useRole } from './role-provider';
import EliteMembership from './elite-membership';
import VipMembership from './vip-membership';
import { isServiceUnlocked } from '@/lib/services/access-client';
import { GrowthJournalSection } from './growth-journal-section';
import { VisionTimelineSection } from './vision-timeline-section';
import { AffiliateDashboard } from './affiliate/affiliate-dashboard';
import { MarketingToolkit } from './marketing/marketing-toolkit';
import { CampaignManager } from './campaigns/campaign-manager';
import { OptimizerDashboard } from './optimizer/optimizer-dashboard';
import { PerformanceAnalyticsSection } from './performance-analytics-section';
import { ReportsSection } from './reports-section';
import { AICoachSection } from './ai-coach-section';
import { ConsistencySection } from './consistency-section';
import { PerformanceEngineSection } from './performance-engine-section';
import { TerminalSection } from './terminal-section';
import { DashboardCommandPalette } from './dashboard-command-palette';

type DashboardTab = 
  | 'overview'
  | 'community'
  | 'community-hub'
  | 'signals'
  | 'courses'
  | 'mentorship'
  | 'profile'
  | 'admin'
  | 'ai'
  | 'funding'
  | 'notifications'
  | 'wallet'
  | 'leaderboard'
  | 'learning-path'
  | 'analytics'
  | 'gold-to-glory'
  | 'elite-membership'
  | 'vip-membership'
  | 'mentor'
  | 'journal'
  | 'timeline'
  | 'affiliate'
  | 'marketing'
  | 'campaigns'
  | 'optimizer'
  | 'auto-trader'
  | 'reports'
  | 'ai-coach'
  | 'consistency'
  | 'performance'
  | 'terminal';

export default function DashboardLayout(props: { initialSection?: DashboardTab }) {
  return (
    <RoleProvider>
      <DashboardLayoutInner {...props} />
    </RoleProvider>
  );
}

const ALLOWED_SECTIONS: DashboardTab[] = [
  'overview',
  'community-hub',
  'signals',
  'courses',
  'mentorship',
  'profile',
  'admin',
  'ai',
  'funding',
  'notifications',
  'auto-trader',
  'gold-to-glory',
  'mentor',
  'elite-membership',
  'vip-membership',
  'learning-path',
  'journal',
  'timeline',
  'affiliate',
  'marketing',
  'campaigns',
  'optimizer',
  'analytics',
  'reports',
  'ai-coach',
  'consistency',
  'performance',
  'terminal',
];

function DashboardLayoutInner({ initialSection = 'overview' }: { initialSection?: DashboardTab }) {
  const searchParams = useSearchParams();
  const sectionFromUrl = searchParams.get('section');
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [activeSection, setActiveSectionState] = useState<DashboardTab>(() => {
    if (sectionFromUrl && ALLOWED_SECTIONS.includes(sectionFromUrl as DashboardTab)) return sectionFromUrl as DashboardTab;
    return initialSection;
  });
  const router = useRouter();

  // Sync activeSection from URL when ?section= changes (e.g. overview buttons, external links)
  useEffect(() => {
    if (sectionFromUrl && ALLOWED_SECTIONS.includes(sectionFromUrl as DashboardTab)) {
      setActiveSectionState(sectionFromUrl as DashboardTab);
    }
  }, [sectionFromUrl]);

  const setActiveSection = useCallback(
    (section: DashboardTab) => {
      setActiveSectionState(section);
      router.replace(`/dashboard?section=${section}`, { scroll: false });
    },
    [router]
  );

  // Prefetch home so signing out doesn't trigger a cold load (avoids CSS 404s)
  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  // Global command palette: Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((open) => !open);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const supabase = createSupabaseClient();
  const { toast } = useToast();

  const { user, profile, role, loading: roleLoading, hasAdminAccess, hasOwnerAccess } = useRole();
  const roleForPermissions = (role === 'admin' || role === 'owner' ? 'ADMIN' : 'MEMBER') as UserRole;
  const { permissions, loading: permissionsLoading } = usePermissions(user?.id, roleForPermissions);
  const {
    notifications,
    unreadCount,
    loading: notificationsLoading,
    markAsRead,
    markAllAsRead,
    refresh: refreshNotifications,
  } = useUserNotifications(user?.id);
  const {
    services: access,
    isUnlocked,
    unlockService,
    loading: servicesLoading,
    unlockedCount,
  } = useUserServices(user?.id);
  const { handleCheckout, loadingKey } = useCheckout();

  const safeMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error: any) {
      console.error('Mark as read error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Could not mark notification as read',
        variant: 'destructive',
      });
    }
  };

  const safeMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error: any) {
      console.error('Mark all as read error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Could not mark all as read',
        variant: 'destructive',
      });
    }
  };

  const safeRefreshNotifications = async () => {
    try {
      await refreshNotifications();
    } catch (error: any) {
      console.error('Refresh notifications error:', error);
      toast({
        title: 'Error',
        description: error?.message || 'Could not refresh notifications',
        variant: 'destructive',
      });
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (roleLoading || permissionsLoading || servicesLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-gray-200">
          Loading your dashboard access…
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-sm text-gray-200">
          No active session.{' '}
          <button className="underline text-gold-300" onClick={() => router.push('/signin')}>
            Sign in again
          </button>
        </div>
      </div>
    );
  }

  const userWithProfile = { ...user, ...profile, role };
  const userRoleForPermissions = roleForPermissions;

  const ensureAccess = (serviceKey: 'signals' | 'gold_to_glory' | 'elite_membership' | 'vip_membership') => {
    if (!user) {
      router.push(`/signin?redirectTo=${encodeURIComponent('/dashboard')}`);
      return false;
    }
    if (!isUnlocked(serviceKey as any)) {
      router.push(`/pricing?product=${serviceKey}`);
      return false;
    }
    return true;
  };

  const effectiveSection: DashboardTab =
    sectionFromUrl && ALLOWED_SECTIONS.includes(sectionFromUrl as DashboardTab)
      ? (sectionFromUrl as DashboardTab)
      : activeSection;

  const renderSection = () => {
    const userRole = userRoleForPermissions;
    switch (effectiveSection) {
      case 'overview':
        return <DashboardOverview user={userWithProfile} access={access} unlockedCount={unlockedCount} />;
      case 'community':
      case 'community-hub':
        if (!hasPermission(userRole, 'community', 'view')) {
          return <AccessDenied feature="Community Hub" requiredRole="MEMBER" />;
        }
        if (!isUnlocked('community')) {
          return (
            <LockedFeature
              serviceKey="community"
              title="Community Hub"
              description="Unlock the community to chat, share trades, and learn together."
              onCheckout={() => handleCheckout('community')}
              onUnlock={() =>
                unlockService('community').catch((e: any) =>
                  toast({ title: 'Error', description: e?.message || 'Failed to unlock', variant: 'destructive' })
                )
              }
              ctaHref="/pricing"
            />
          );
        }
        return <CommunityHub user={userWithProfile} />;
      case 'signals':
        if (!hasPermission(userRole, 'signals', 'view_basic')) {
          return <AccessDenied feature="Trading Signals" requiredRole="MEMBER" />;
        }
        if (!ensureAccess('signals')) return null;
        return <SignalsSection user={userWithProfile} />;
      case 'ai':
        return <AIAssistant user={userWithProfile} />;
      case 'funding':
        if (!isUnlocked('funding')) {
          return (
            <LockedFeature
              serviceKey="funding"
              title="Funding Account Portal"
              description="Unlock the funding portal to manage prop firm submissions and status."
              onCheckout={() => handleCheckout('funding')}
              onUnlock={() =>
                unlockService('funding').catch((e: any) =>
                  toast({ title: 'Error', description: e?.message || 'Failed to unlock', variant: 'destructive' })
                )
              }
              ctaHref="/pricing"
            />
          );
        }
        return <FundingAccountSection user={userWithProfile} />;
      case 'courses':
        if (!hasPermission(userRole, 'courses', 'view_basic')) {
          return <AccessDenied feature="Courses" requiredRole="VIEWER" />;
        }
        if (!isUnlocked('courses')) {
          return (
            <LockedFeature
              serviceKey="courses"
              title="Courses & Education"
              description="Unlock the education library to access all courses."
              onCheckout={() => handleCheckout('courses')}
              onUnlock={() =>
                unlockService('courses').catch((e: any) =>
                  toast({ title: 'Error', description: e?.message || 'Failed to unlock', variant: 'destructive' })
                )
              }
              ctaHref="/pricing"
            />
          );
        }
        return <CoursesSection user={userWithProfile} />;
      case 'mentorship':
        if (!hasPermission(userRole, 'mentorship', 'book')) {
          return <AccessDenied feature="Mentorship" requiredRole="TRADER" subscriptionRequired />;
        }
        if (!isUnlocked('mentorship')) {
          return (
            <LockedFeature
              serviceKey="mentorship"
              title="Mentorship"
              description="Unlock mentorship to book sessions with expert coaches."
              onCheckout={() => handleCheckout('mentorship')}
              onUnlock={() =>
                unlockService('mentorship').catch((e: any) =>
                  toast({ title: 'Error', description: e?.message || 'Failed to unlock', variant: 'destructive' })
                )
              }
              ctaHref="/pricing"
            />
          );
        }
        return <MentorshipSection user={userWithProfile} />;
      case 'profile':
        return <ProfileSection user={userWithProfile} />;
      case 'notifications':
        return (
          <NotificationsPanel
            notifications={notifications}
            loading={notificationsLoading}
            unreadCount={unreadCount}
            onMarkAsRead={safeMarkAsRead}
            onMarkAllAsRead={safeMarkAllAsRead}
            onRefresh={safeRefreshNotifications}
          />
        );
      case 'wallet':
        return <WalletView />;
      case 'leaderboard':
        return <LeaderboardView />;
      case 'learning-path':
        return (
          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-white">Adaptive Learning Path</h1>
            <p className="text-gray-400">
              AI-generated lessons and challenges tailored to your trading patterns.
            </p>
            <LearningPathList />
          </div>
        );
      case 'auto-trader':
        return (
          <AutoTraderSection
            hasAccess={Boolean((access as any)?.auto_trader)}
          />
        );
      case 'gold-to-glory':
        if (!ensureAccess('gold_to_glory')) return null;
        return <GoldToGlory hasAccess={isServiceUnlocked(access as any, 'gold_to_glory')} />;
      case 'elite-membership':
        if (!ensureAccess('elite_membership')) return null;
        return <EliteMembership />;
      case 'vip-membership':
        if (!ensureAccess('vip_membership')) return null;
        return <VipMembership />;
      case 'mentor':
        return <MentorChat userId={userWithProfile?.id || user?.id} />;
      case 'journal':
        return <GrowthJournalSection />;
      case 'timeline':
        return <VisionTimelineSection />;
      case 'affiliate':
        return <AffiliateDashboard />;
      case 'marketing':
        return <MarketingToolkit />;
      case 'campaigns':
        return <CampaignManager />;
      case 'optimizer':
        return <OptimizerDashboard />;
      case 'analytics':
        return <PerformanceAnalyticsSection />;
      case 'reports':
        return <ReportsSection />;
      case 'ai-coach':
        return <AICoachSection />;
      case 'consistency':
        return <ConsistencySection />;
      case 'performance':
        return <PerformanceEngineSection />;
      case 'terminal':
        return <TerminalSection />;
      case 'admin':
        if (!hasAdminAccess) {
          return <AccessDenied feature="Admin Control Panel" requiredRole="ADMIN" />;
        }
        return <AdminHub user={{ ...userWithProfile, adminRole: (hasOwnerAccess ? 'OWNER' : 'ADMIN') as any }} />;
      default:
        return <DashboardOverview user={userWithProfile} />;
    }
  };

  if (roleLoading || permissionsLoading) {
    return (
      <div className="min-h-screen bg-page flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-page text-foreground">
      <DashboardCommandPalette
        open={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(sectionId) => setActiveSection(sectionId as DashboardTab)}
      />
      <DashboardHeader
        user={user}
        onSignOut={handleSignOut}
        onMenuToggle={() => {}}
        onNotificationsClick={() => setActiveSection('notifications')}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        unreadCount={unreadCount}
      />
      
      <div className="relative flex gap-4 lg:gap-6 max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pb-24 lg:pb-10 pt-3 lg:pt-6">
        <DashboardSidebar
          activeSection={effectiveSection as any}
          onSectionChange={(section) => setActiveSection(section as DashboardTab)}
          user={{
            ...user,
            ...profile,
            role,
            adminRole: hasOwnerAccess ? 'OWNER' : hasAdminAccess ? 'ADMIN' : null,
          }}
          hasAdminAccess={hasAdminAccess}
          permissions={permissions}
        />
        <main className="flex-1 min-w-0">
          <div className="min-h-[calc(100vh-5rem)] lg:min-h-[calc(100vh-6rem)] rounded-xl border border-border-subtle bg-panel backdrop-blur-sm p-4 sm:p-6 lg:p-8">
            {loadingKey && (
              <p className="mb-4 text-xs text-primary">Starting checkout for {loadingKey}…</p>
            )}
            {renderSection()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav: 5 primary actions */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/98 backdrop-blur-md border-t border-border-subtle">
        <div className="grid grid-cols-5 gap-1 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          {[
            { id: 'overview', label: 'Home', icon: HomeIcon },
            { id: 'terminal', label: 'Command', icon: CommandLineIcon },
            { id: 'signals', label: 'Signals', icon: ChartBarIcon },
            { id: 'community-hub', label: 'Community', icon: ChatBubbleLeftRightIcon },
            { id: 'profile', label: 'Account', icon: UserIcon },
          ].map((item) => {
            const isActive = effectiveSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveSection(item.id as DashboardTab)}
                className={`flex flex-col items-center justify-center py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2 focus:ring-offset-background ${
                  isActive ? 'text-primary bg-accent-muted' : 'text-muted-foreground hover:text-foreground'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className="h-6 w-6" />
                <span className="text-[10px] font-medium mt-1 text-center leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
        {hasAdminAccess && (
          <div className="px-2 pb-2">
            <a
              href="/dashboard/admin"
              className="flex items-center justify-center gap-2 w-full py-2 rounded-lg text-xs font-semibold text-primary bg-accent-muted border border-primary/20"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Admin
            </a>
          </div>
        )}
      </nav>
    </div>
  );
}

// Access Denied Component
function AccessDenied({ 
  feature, 
  requiredRole, 
  subscriptionRequired 
}: { 
  feature: string; 
  requiredRole: string;
  subscriptionRequired?: boolean;
}) {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-500/20 border border-red-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Access Restricted</h2>
        <p className="text-gray-300 mb-4">
          You don't have permission to access {feature}.
        </p>
        {subscriptionRequired ? (
          <div className="bg-gold-500/20 border border-gold-500/30 rounded-lg p-4">
            <p className="text-sm text-gold-400 mb-2">
              <strong>Subscription Required:</strong> This feature requires an active subscription plan.
            </p>
            <a href="/pricing" className="text-gold-400 hover:text-gold-300 font-medium text-sm">
              View Plans →
            </a>
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-300">
              <strong>Required Role:</strong> {requiredRole}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Contact an administrator to upgrade your account.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
