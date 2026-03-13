'use client';

import { useState } from 'react';
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
} from '@heroicons/react/24/outline';
import { hasPermission, UserPermissions } from '@/lib/permissions';
import { Crown, Lock, Sparkles, DollarSign } from 'lucide-react';

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

interface DashboardSidebarProps {
  activeSection: DashboardSection | string;
  onSectionChange: (section: DashboardSection | string) => void;
  user: any;
  permissions?: UserPermissions | null;
  hasAdminAccess?: boolean;
}

export default function DashboardSidebar({ activeSection, onSectionChange, user, permissions, hasAdminAccess }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  const normalizedRole = (user?.role || 'member').toString().toLowerCase();
  const userRole = (normalizedRole === 'admin' || normalizedRole === 'owner' ? 'ADMIN' : 'MEMBER') as any;

  const navigation = [
    { 
      id: 'overview', 
      name: 'Dashboard', 
      icon: HomeIcon, 
      href: '#overview',
      requiredPermission: null,
      requiredRole: null,
    },
    { 
      id: 'signals', 
      name: 'Signals', 
      icon: ChartBarIcon, 
      href: '#signals',
      requiredPermission: { resource: 'signals', action: 'view_basic' },
      requiredRole: 'MEMBER',
    },
    { 
      id: 'community-hub', 
      name: 'Community', 
      icon: ChatBubbleLeftRightIcon, 
      href: '#community-hub',
      requiredPermission: { resource: 'community', action: 'view' },
      requiredRole: 'MEMBER',
    },
    { 
      id: 'courses', 
      name: 'Education', 
      icon: AcademicCapIcon, 
      href: '#courses',
      requiredPermission: { resource: 'courses', action: 'view_basic' },
      requiredRole: 'VIEWER',
    },
    { 
      id: 'auto-trader', 
      name: 'Auto Trader', 
      icon: CpuChipIcon, 
      href: '#auto-trader',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'gold-to-glory', 
      name: 'Gold to Glory (G2G)', 
      icon: CpuChipIcon, 
      href: '#gold-to-glory',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'profile', 
      name: 'Account', 
      icon: UserIcon, 
      href: '#profile',
      requiredPermission: null,
      requiredRole: null,
    },
    { 
      id: 'ai', 
      name: 'AI Assistant', 
      icon: Sparkles, 
      href: '#ai',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'wallet', 
      name: 'Rewards Wallet', 
      icon: BellIcon, 
      href: '#wallet',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'learning-path', 
      name: 'Learning Path', 
      icon: ChartBarIcon, 
      href: '#learning-path',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'mentor', 
      name: 'AI Mentor', 
      icon: Sparkles, 
      href: '#mentor',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'journal', 
      name: 'Growth Journal', 
      icon: ChartBarIcon, 
      href: '#journal',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'timeline', 
      name: 'Vision Timeline', 
      icon: ChartBarIcon, 
      href: '#timeline',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'affiliate', 
      name: 'Affiliate', 
      icon: ChartBarIcon, 
      href: '#affiliate',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'marketing', 
      name: 'Marketing', 
      icon: ChartBarIcon, 
      href: '#marketing',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'campaigns', 
      name: 'Campaigns', 
      icon: ChartBarIcon, 
      href: '#campaigns',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'optimizer', 
      name: 'Optimizer', 
      icon: ChartBarIcon, 
      href: '#optimizer',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'analytics', 
      name: 'Performance Analytics', 
      icon: ChartBarIcon, 
      href: '#analytics',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'reports', 
      name: 'Reports', 
      icon: ChartBarIcon, 
      href: '#reports',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'ai-coach', 
      name: 'AI Trade Coach', 
      icon: Sparkles, 
      href: '#ai-coach',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'consistency', 
      name: 'Consistency & Discipline', 
      icon: ChartBarIcon, 
      href: '#consistency',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'performance', 
      name: 'Performance Engine', 
      icon: ChartBarIcon, 
      href: '#performance',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'terminal', 
      name: 'Command Center', 
      icon: CommandLineIcon, 
      href: '#terminal',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'notifications', 
      name: 'Notifications', 
      icon: BellIcon, 
      href: '#notifications',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'progress', 
      name: 'Progress', 
      icon: Sparkles, 
      href: '/dashboard/progress',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'funding', 
      name: 'Funding Accounts', 
      icon: DollarSign, 
      href: '#funding',
      requiredPermission: null,
      requiredRole: 'MEMBER',
    },
    { 
      id: 'mentorship', 
      name: 'Mentorship', 
      icon: UserGroupIcon, 
      href: '#mentorship',
      requiredPermission: { resource: 'mentorship', action: 'book' },
      requiredRole: 'TRADER',
      subscriptionRequired: true,
    },
  ];

  // Filter navigation based on permissions
  const filteredNavigation = navigation.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(userRole, item.requiredPermission.resource as any, item.requiredPermission.action as any);
  });
  const roleLabel = normalizedRole.charAt(0).toUpperCase() + normalizedRole.slice(1);
  const isAdmin = Boolean(hasAdminAccess);

  return (
    <div className="hidden lg:flex">
      <div
        className={`flex h-full flex-col min-h-[calc(100vh-1rem)] lg:min-h-[calc(100vh-5rem)] rounded-none lg:rounded-2xl bg-white/5 border-r lg:border border-white/10 backdrop-blur-md shadow-[0_15px_45px_-30px_rgba(0,0,0,0.75)] w-72 ${
          collapsed ? 'lg:w-20' : 'lg:w-72'
        }`}
      >
        <div className="p-4 pb-2 border-b border-white/10 flex items-center justify-between">
          {!collapsed && (
            <div>
              <p className="text-[11px] uppercase tracking-[0.2em] text-gray-400">Workspace</p>
              <h2 className="text-xl font-semibold text-white">Trading Desk</h2>
            </div>
          )}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060910]"
              aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        <nav className="mt-3 flex-1 overflow-y-auto px-3 space-y-1">
          {filteredNavigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const hasSubscription = permissions?.subscription?.isActive;
            const needsSubscription = item.subscriptionRequired && !hasSubscription;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (!needsSubscription) {
                    onSectionChange(item.id as DashboardSection);
                  }
                }}
                disabled={needsSubscription}
                aria-current={isActive ? 'page' : undefined}
                className={`group w-full flex items-center gap-3 px-3.5 py-2.5 text-left rounded-xl border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060910] ${
                  isActive
                    ? 'bg-gradient-to-r from-gold-500/15 via-amber-500/10 to-transparent text-white border-gold-500/40 shadow-[0_10px_30px_-18px_rgba(250,204,21,0.45)]'
                    : needsSubscription
                    ? 'text-gray-600 cursor-not-allowed opacity-60 border-transparent'
                    : 'text-gray-300 hover:text-white hover:bg-white/5 border-transparent'
                }`}
                title={needsSubscription ? 'Subscription required' : item.name}
              >
                <Icon className={`h-5 w-5 ${collapsed ? 'mx-auto' : ''} ${isActive ? 'text-gold-300' : 'text-gray-400 group-hover:text-gray-200'}`} />
                {!collapsed && (
                  <>
                    <span className="font-medium flex-1">{item.name}</span>
                    {hasSubscription && item.subscriptionRequired && (
                      <Crown className="h-4 w-4 text-gold-300 ml-1" />
                    )}
                    {needsSubscription && (
                      <Lock className="h-4 w-4 text-gray-600 ml-1" />
                    )}
                  </>
                )}
              </button>
            );
          })}
        </nav>

        {isAdmin && !collapsed && (
          <div className="px-4 mt-4">
            <a
              href="/dashboard/admin"
              className="block text-center text-sm font-semibold text-black bg-gold-500 hover:bg-gold-600 rounded-xl py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gold-400 focus-visible:ring-offset-[#060910]"
            >
              Admin Portal
            </a>
          </div>
        )}

        {/* User Info */}
        <div className="p-4 border-t border-white/10 shrink-0 mt-4">
          <button
            type="button"
            onClick={() => onSectionChange('profile')}
            className={`w-full flex items-center rounded-xl ${collapsed ? 'justify-center' : 'space-x-3'} hover:bg-white/5 transition-colors p-3 border border-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-[#060910]`}
            title="View profile"
          >
            <div className="w-9 h-9 bg-gold-500 rounded-full flex items-center justify-center ring-2 ring-gold-500/30">
              <span className="text-black text-sm font-semibold">
                {user?.email?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0 text-left">
                <p className="text-sm font-semibold text-white truncate">
                  {user?.email || 'User'}
                </p>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-gray-400 capitalize">
                    {roleLabel}
                  </p>
                  {permissions?.subscription?.isActive && (
                    <span className="px-1.5 py-0.5 bg-gold-500/15 border border-gold-500/25 text-gold-200 rounded text-[11px] font-semibold">
                      {permissions.subscription.planName}
                    </span>
                  )}
                </div>
              </div>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
