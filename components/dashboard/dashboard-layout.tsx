'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  AcademicCapIcon, 
  UserIcon,
  CpuChipIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { AdminHub } from './admin/admin-hub';
import { RoleProvider, useRole } from './role-provider';

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
  | 'mentor'
  | 'journal'
  | 'timeline'
  | 'affiliate'
  | 'marketing'
  | 'campaigns'
  | 'optimizer'
  | 'auto-trader';

export default function DashboardLayout(props: { initialSection?: DashboardTab }) {
  return (
    <RoleProvider>
      <DashboardLayoutInner {...props} />
    </RoleProvider>
  );
}

function DashboardLayoutInner({ initialSection = 'overview' }: { initialSection?: DashboardTab }) {
  const [activeSection, setActiveSection] = useState<DashboardTab>(initialSection);
  const router = useRouter();

  // Prefetch home so signing out doesn't trigger a cold load (avoids CSS 404s)
  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  // Handle section from URL query parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const section = params.get('section');
    const allowedSections: DashboardTab[] = [
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
    ];
    if (section && allowedSections.includes(section as DashboardTab)) {
      setActiveSection(section as DashboardTab);
    }
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

  if (!user) {
    return null;
  }

  const userWithProfile = { ...user, ...profile, role };
  const userRoleForPermissions = roleForPermissions;

  const renderSection = () => {
    const userRole = userRoleForPermissions;
    switch (activeSection) {
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
        if (!isUnlocked('signals')) {
          return (
            <LockedFeature
              serviceKey="signals"
              title="Trading Signals"
              description="Unlock high-conviction signals and market insights."
              onCheckout={() => handleCheckout('signals')}
              onUnlock={() =>
                unlockService('signals').catch((e: any) =>
                  toast({ title: 'Error', description: e?.message || 'Failed to unlock', variant: 'destructive' })
                )
              }
              ctaHref="/pricing"
            />
          );
        }
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
        return <GoldToGlory hasAccess={Boolean((access as any)?.gold_to_glory)} />;
      case 'mentor':
        return <MentorChat userId={userWithProfile?.id || user?.id} />;
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold-500 mx-auto"></div>
          <p className="mt-4 text-gray-300">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#05080f] via-[#060910] to-black text-gray-100">
      <DashboardHeader 
        user={user} 
        onSignOut={handleSignOut}
        onMenuToggle={() => {}} // handled by bottom nav on mobile
        onNotificationsClick={() => setActiveSection('notifications')}
        unreadCount={unreadCount}
      />
      
      <div className="relative flex gap-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-[calc(5.5rem+env(safe-area-inset-bottom))] lg:pb-10 pt-3 lg:pt-6">
        <DashboardSidebar
          activeSection={activeSection as any}
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
        
        <main className="flex-1">
          <div className="min-h-[calc(100vh-6rem)] rounded-2xl border border-white/5 bg-white/5 backdrop-blur-sm shadow-[0_20px_60px_-35px_rgba(0,0,0,0.6)] p-5 sm:p-6 lg:p-8">
            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs text-gray-300">
              <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15 text-gray-100">
                Unlocked {unlockedCount} of 5 services
              </span>
              {servicesLoading && <span className="text-xs text-gray-500">Refreshing access...</span>}
              {loadingKey && (
                <span className="text-xs text-gray-500">
                  Starting checkout for {loadingKey}...
                </span>
              )}
            </div>
            {renderSection()}
          </div>
        </main>
      </div>

      {/* Mobile Bottom Nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0b101a]/95 backdrop-blur-md border-t border-white/10 px-3 pt-2 pb-[calc(1rem+env(safe-area-inset-bottom))]">
        <div className="grid grid-cols-6 gap-2">
          {[
            { id: 'overview', label: 'Dashboard', icon: HomeIcon },
            { id: 'signals', label: 'Signals', icon: ChartBarIcon },
            { id: 'community-hub', label: 'Community', icon: ChatBubbleLeftRightIcon },
            { id: 'courses', label: 'Education', icon: AcademicCapIcon },
            { id: 'auto-trader', label: 'Auto Trader', icon: CpuChipIcon },
            { id: 'gold-to-glory', label: 'G2G', icon: CpuChipIcon },
            { id: 'profile', label: 'Account', icon: UserIcon },
          ].map((item) => {
            const isActive = activeSection === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as DashboardTab)}
                className={`flex flex-col items-center justify-center py-2.5 rounded-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b101a] ${
                  isActive
                    ? 'text-white bg-white/10 border border-white/15 shadow-sm'
                    : 'text-gray-400 hover:text-white'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`h-6 w-6 ${isActive ? 'text-gold-300' : 'text-gray-400'}`} />
                <span className="text-[11px] font-semibold mt-1 text-center leading-tight">{item.label}</span>
              </button>
            );
          })}
        </div>
        {(() => {
          if (!hasAdminAccess) return null;

          return (
            <div className="mt-2">
              <button
                onClick={() => {
                  setActiveSection('admin');
                  router.push('/dashboard/admin');
                }}
                className={`w-full flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b101a] ${
                  activeSection === 'admin'
                    ? 'text-white bg-white/10 border-white/20'
                    : 'text-gold-200 bg-emerald-500/10 border-emerald-400/30'
                }`}
              >
                <ShieldCheckIcon className="h-5 w-5" />
                Admin
              </button>
            </div>
          );
        })()}
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
