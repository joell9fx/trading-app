'use client';

import { useState, useMemo, useEffect } from 'react';
import {
  HomeIcon,
  ChartBarIcon,
  ChatBubbleLeftRightIcon,
  AcademicCapIcon,
  UserGroupIcon,
  UserIcon,
  ShieldCheckIcon,
  BellIcon,
  CpuChipIcon,
  CommandLineIcon,
  BookOpenIcon,
  SparklesIcon,
  DocumentChartBarIcon,
  ChartBarSquareIcon,
  ClipboardDocumentCheckIcon,
  Cog6ToothIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  WalletIcon,
  CurrencyDollarIcon,
  SignalIcon,
  PresentationChartLineIcon,
  MapIcon,
  LightBulbIcon,
  ChatBubbleBottomCenterTextIcon,
  ShareIcon,
  MegaphoneIcon,
  CalendarDaysIcon,
  AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { hasPermission, UserPermissions } from '@/lib/permissions';
import { Crown, Lock } from 'lucide-react';

type DashboardSection =
  | 'overview'
  | 'community'
  | 'admin'
  | 'community-hub'
  | 'signals'
  | 'courses'
  | 'mentorship'
  | 'profile'
  | 'ai'
  | 'funding'
  | 'notifications'
  | 'wallet'
  | 'leaderboard'
  | 'learning-path'
  | 'analytics'
  | 'mentor'
  | 'journal'
  | 'timeline'
  | 'affiliate'
  | 'marketing'
  | 'campaigns'
  | 'optimizer'
  | 'gold-to-glory'
  | 'progress'
  | 'auto-trader'
  | 'reports'
  | 'ai-coach'
  | 'consistency'
  | 'performance'
  | 'terminal';

interface NavItem {
  id: DashboardSection | string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  external?: boolean;
  requiredPermission?: { resource: string; action: string } | null;
  requiredRole?: string | null;
  subscriptionRequired?: boolean;
}

interface NavGroup {
  id: string;
  label: string;
  items: NavItem[];
  defaultExpanded?: boolean;
}

interface DashboardSidebarProps {
  activeSection: DashboardSection | string;
  onSectionChange: (section: DashboardSection | string) => void;
  user: { email?: string; [key: string]: unknown };
  permissions?: UserPermissions | null;
  hasAdminAccess?: boolean;
}

export const NAV_GROUPS: NavGroup[] = [
  {
    id: 'overview',
    label: 'Overview',
    items: [{ id: 'overview', name: 'Dashboard', icon: HomeIcon }],
    defaultExpanded: true,
  },
  {
    id: 'trading',
    label: 'Trading',
    items: [
      { id: 'signals', name: 'Signals', icon: SignalIcon, requiredPermission: { resource: 'signals', action: 'view_basic' }, requiredRole: 'MEMBER' },
      { id: 'auto-trader', name: 'Auto Trader', icon: CpuChipIcon, requiredRole: 'MEMBER' },
      { id: 'gold-to-glory', name: 'Gold to Glory', icon: ChartBarSquareIcon, requiredRole: 'MEMBER' },
    ],
    defaultExpanded: true,
  },
  {
    id: 'performance',
    label: 'Performance',
    items: [
      { id: 'terminal', name: 'Command Center', icon: CommandLineIcon, requiredRole: 'MEMBER' },
      { id: 'analytics', name: 'Analytics', icon: PresentationChartLineIcon, requiredRole: 'MEMBER' },
      { id: 'reports', name: 'Reports', icon: DocumentChartBarIcon, requiredRole: 'MEMBER' },
      { id: 'performance', name: 'Performance Engine', icon: Cog6ToothIcon, requiredRole: 'MEMBER' },
      { id: 'ai-coach', name: 'AI Trade Coach', icon: SparklesIcon, requiredRole: 'MEMBER' },
      { id: 'consistency', name: 'Consistency', icon: ClipboardDocumentCheckIcon, requiredRole: 'MEMBER' },
    ],
    defaultExpanded: true,
  },
  {
    id: 'journal',
    label: 'Journal',
    items: [
      { id: 'journal', name: 'Growth Journal', icon: BookOpenIcon, requiredRole: 'MEMBER' },
      { id: 'timeline', name: 'Vision Timeline', icon: MapIcon, requiredRole: 'MEMBER' },
    ],
    defaultExpanded: false,
  },
  {
    id: 'learning',
    label: 'Learning',
    items: [
      { id: 'courses', name: 'Education', icon: AcademicCapIcon, requiredPermission: { resource: 'courses', action: 'view_basic' }, requiredRole: 'VIEWER' },
      { id: 'learning-path', name: 'Learning Path', icon: LightBulbIcon, requiredRole: 'MEMBER' },
      { id: 'mentor', name: 'AI Mentor', icon: ChatBubbleBottomCenterTextIcon, requiredRole: 'MEMBER' },
      { id: 'mentorship', name: 'Mentorship', icon: UserGroupIcon, requiredPermission: { resource: 'mentorship', action: 'book' }, requiredRole: 'TRADER', subscriptionRequired: true },
      { id: 'progress', name: 'Progress', icon: ChartBarIcon, href: '/dashboard/progress', external: true, requiredRole: 'MEMBER' },
    ],
    defaultExpanded: false,
  },
  {
    id: 'community',
    label: 'Community',
    items: [
      { id: 'community-hub', name: 'Community', icon: ChatBubbleLeftRightIcon, requiredPermission: { resource: 'community', action: 'view' }, requiredRole: 'MEMBER' },
    ],
    defaultExpanded: false,
  },
  {
    id: 'account',
    label: 'Account',
    items: [
      { id: 'profile', name: 'Account', icon: UserIcon },
      { id: 'notifications', name: 'Notifications', icon: BellIcon, requiredRole: 'MEMBER' },
      { id: 'funding', name: 'Funding', icon: CurrencyDollarIcon, requiredRole: 'MEMBER' },
      { id: 'wallet', name: 'Rewards Wallet', icon: WalletIcon, requiredRole: 'MEMBER' },
      { id: 'ai', name: 'AI Assistant', icon: ChatBubbleBottomCenterTextIcon, requiredRole: 'MEMBER' },
    ],
    defaultExpanded: false,
  },
  {
    id: 'creator',
    label: 'Creator',
    items: [
      { id: 'affiliate', name: 'Affiliate', icon: ShareIcon, requiredRole: 'MEMBER' },
      { id: 'marketing', name: 'Marketing', icon: MegaphoneIcon, requiredRole: 'MEMBER' },
      { id: 'campaigns', name: 'Campaigns', icon: CalendarDaysIcon, requiredRole: 'MEMBER' },
      { id: 'optimizer', name: 'Optimizer', icon: AdjustmentsHorizontalIcon, requiredRole: 'MEMBER' },
    ],
    defaultExpanded: false,
  },
];

const STORAGE_KEY = 'dashboard-nav-expanded';

export default function DashboardSidebar({
  activeSection,
  onSectionChange,
  user,
  permissions,
  hasAdminAccess,
}: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        return new Set(parsed);
      }
    } catch {
      /* ignore */
    }
    return new Set(NAV_GROUPS.filter((g) => g.defaultExpanded).map((g) => g.id));
  });

  const normalizedRole = (user?.role || 'member').toString().toLowerCase();
  const userRole = (normalizedRole === 'admin' || normalizedRole === 'owner' ? 'ADMIN' : 'MEMBER') as 'ADMIN' | 'MEMBER';
  const roleLabel = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
  const isAdmin = Boolean(hasAdminAccess);
  const hasSubscription = Boolean(permissions?.subscription?.isActive);

  const activeGroupId = useMemo(() => {
    for (const group of NAV_GROUPS) {
      if (group.items.some((i) => i.id === activeSection)) return group.id;
    }
    return null;
  }, [activeSection]);

  useEffect(() => {
    if (activeGroupId && !expandedGroups.has(activeGroupId)) {
      setExpandedGroups((prev) => {
        const next = new Set(prev);
        next.add(activeGroupId);
        try {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
        } catch {
          /* ignore */
        }
        return next;
      });
    }
  }, [activeGroupId]);

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(groupId)) next.delete(groupId);
      else next.add(groupId);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(next)));
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const filterItem = (item: NavItem) => {
    if (!item.requiredPermission) return true;
    return hasPermission(userRole, item.requiredPermission.resource as Parameters<typeof hasPermission>[1], item.requiredPermission.action as Parameters<typeof hasPermission>[2]);
  };

  return (
    <div className="hidden lg:flex">
      <div
        className={`flex h-full flex-col min-h-[calc(100vh-1rem)] lg:min-h-[calc(100vh-5rem)] rounded-none lg:rounded-xl bg-surface border-r lg:border border-border-subtle backdrop-blur-md w-[16rem] ${
          collapsed ? 'lg:w-[4.25rem]' : 'lg:w-[16rem]'
        } transition-all duration-200 ease-out`}
      >
        {/* Header */}
        <div className="shrink-0 flex items-center justify-between h-14 px-4 border-b border-border-subtle">
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground">Workspace</p>
              <p className="text-sm font-semibold text-foreground truncate">Trading Desk</p>
            </div>
          )}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-panel transition-colors focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Groups */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {NAV_GROUPS.map((group, idx) => {
            const filteredItems = group.items.filter(filterItem);
            if (filteredItems.length === 0) return null;

            const isExpanded = collapsed ? false : expandedGroups.has(group.id);
            const hasActive = filteredItems.some((i) => i.id === activeSection);

            return (
              <div key={group.id} className={idx === 0 ? '' : 'mt-5 pt-4 border-t border-border-subtle'}>
                {collapsed ? (
                  filteredItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = !item.external && activeSection === item.id;
                    const needsSub = item.subscriptionRequired && !hasSubscription;
                    if (item.external && item.href) {
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          title={item.name}
                          className="w-full flex items-center justify-center py-2.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-panel transition-colors"
                        >
                          <Icon className="h-5 w-5" />
                        </a>
                      );
                    }
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => !needsSub && onSectionChange(item.id as DashboardSection)}
                        disabled={needsSub}
                        title={item.name}
                        aria-current={isActive ? 'page' : undefined}
                        className={`w-full flex items-center justify-center py-2.5 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                          isActive ? 'bg-panel text-foreground' : needsSub ? 'text-muted-foreground/60' : 'text-muted-foreground hover:text-foreground hover:bg-panel'
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </button>
                    );
                  })
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.id)}
                      className={`w-full flex items-center gap-2 px-2 py-2.5 rounded-lg text-left transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${
                        hasActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {isExpanded ? (
                        <ChevronDownIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      ) : (
                        <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                      )}
                      <span className="text-[11px] font-medium uppercase tracking-[0.12em]">{group.label}</span>
                    </button>
                    {isExpanded && (
                      <div className="mt-1 ml-2 space-y-0.5 border-l border-border-subtle pl-3">
                        {filteredItems.map((item) => {
                          const Icon = item.icon;
                          const isActive = !item.external && activeSection === item.id;
                          const needsSub = item.subscriptionRequired && !hasSubscription;
                          if (item.external && item.href) {
                            return (
                              <a
                                key={item.id}
                                href={item.href}
                                className="w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-sm text-foreground/80 hover:text-foreground hover:bg-panel transition-all focus:outline-none focus:ring-2 focus:ring-ring"
                              >
                                <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="truncate flex-1 text-left">{item.name}</span>
                              </a>
                            );
                          }
                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => !needsSub && onSectionChange(item.id as DashboardSection)}
                              disabled={needsSub}
                              aria-current={isActive ? 'page' : undefined}
                              className={`w-full flex items-center gap-2.5 py-2 px-2.5 rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-ring ${
                                isActive
                                  ? 'bg-panel text-foreground font-medium'
                                  : needsSub
                                    ? 'text-muted-foreground cursor-not-allowed'
                                    : 'text-foreground/80 hover:text-foreground hover:bg-panel'
                              }`}
                            >
                              <Icon className={`h-4 w-4 shrink-0 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                              <span className="truncate flex-1 text-left">{item.name}</span>
                              {hasSubscription && item.subscriptionRequired && <Crown className="h-3.5 w-3.5 text-primary shrink-0" />}
                              {needsSub && <Lock className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </nav>

        {isAdmin && !collapsed && (
          <div className="shrink-0 p-2 border-t border-border-subtle">
            <a
              href="/dashboard/admin"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg text-sm font-semibold text-primary-foreground bg-primary hover:bg-accent-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50"
            >
              <ShieldCheckIcon className="h-4 w-4" />
              Admin
            </a>
          </div>
        )}

        {/* User */}
        <div className="shrink-0 p-2 border-t border-border-subtle">
          <button
            type="button"
            onClick={() => onSectionChange('profile')}
            className={`w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-panel transition-colors focus:outline-none focus:ring-2 focus:ring-ring ${collapsed ? 'justify-center' : ''}`}
            title="Account"
          >
            <div className="h-9 w-9 shrink-0 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center">
              <span className="text-primary text-sm font-semibold">{String(user?.email ?? 'U').charAt(0).toUpperCase()}</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-foreground truncate">{user?.email ?? 'Account'}</p>
                <p className="text-[11px] text-muted-foreground capitalize">{roleLabel}</p>
                {hasSubscription && (
                  <span className="inline-block mt-0.5 px-1.5 py-0.5 rounded bg-accent-muted border border-primary/20 text-[10px] font-medium text-primary">
                    {permissions?.subscription?.planName ?? 'Pro'}
                  </span>
                )}
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
