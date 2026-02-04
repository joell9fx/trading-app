import { useState, useEffect } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import {
  UserRole,
  UserPermissions,
  hasPermission,
  canAccessPremiumCourses,
  canAccessMentorship,
  getSignalsAccess,
  canCreateSignals,
} from '@/lib/permissions';

export function usePermissions(userId: string | undefined, initialRole?: UserRole) {
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const loadPermissions = async () => {
      try {
        const roleFromCaller = initialRole;

        let roleToUse: UserRole | undefined = roleFromCaller;

        // Fetch role from DB only if caller did not supply one
        if (!roleToUse) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .single();
          roleToUse = (profile?.role || 'MEMBER') as UserRole;
        }

        // Fetch active subscription
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select(`
            plan_id,
            status,
            current_period_end,
            plans:plan_id (
              name
            )
          `)
          .eq('user_id', userId)
          .eq('status', 'active')
          .gt('current_period_end', new Date().toISOString())
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        const userRole = (roleToUse || 'MEMBER') as UserRole;
        const isActive = subscription && new Date(subscription.current_period_end) > new Date();

        setPermissions({
          role: userRole,
          subscription: subscription
            ? {
                planId: subscription.plan_id,
                planName: (subscription.plans as any)?.name || 'free',
                status: subscription.status,
                isActive: !!isActive,
              }
            : undefined,
        });
      } catch (error) {
        console.error('Error loading permissions:', error);
        setPermissions({
          role: 'MEMBER' as UserRole,
        });
      } finally {
        setLoading(false);
      }
    };

    loadPermissions();
  }, [userId, supabase, initialRole]);

  return {
    permissions,
    loading,
    hasPermission: (resource: string, action: string) => {
      if (!permissions) return false;
      return hasPermission(permissions.role, resource as any, action as any);
    },
    canAccessPremiumCourses: () => {
      if (!permissions) return false;
      return canAccessPremiumCourses(permissions.role, permissions.subscription);
    },
    canAccessMentorship: () => {
      if (!permissions) return 'none';
      return canAccessMentorship(permissions.role, permissions.subscription);
    },
    getSignalsAccess: () => {
      if (!permissions) return 'basic';
      return getSignalsAccess(permissions.role, permissions.subscription);
    },
    canCreateSignals: () => {
      if (!permissions) return false;
      return canCreateSignals(permissions.role);
    },
    isAdmin: () => permissions?.role === 'ADMIN',
    isModerator: () => permissions?.role === 'MODERATOR' || permissions?.role === 'ADMIN',
    isTrader: () => permissions?.role === 'TRADER' || permissions?.role === 'MODERATOR' || permissions?.role === 'ADMIN',
  };
}

