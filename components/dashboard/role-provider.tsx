'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseClient } from '@/lib/supabase/client';

type Role = 'member' | 'admin' | 'owner';

type RoleContextValue = {
  user: any | null;
  profile: any | null;
  role: Role;
  loading: boolean;
  error?: string;
  refresh: () => Promise<void>;
  hasAdminAccess: boolean;
  hasOwnerAccess: boolean;
};

const RoleContext = createContext<RoleContextValue | undefined>(undefined);

function normalizeRole(input?: string | null): Role {
  const normalized = (input || '').toString().toLowerCase();
  if (normalized === 'owner') return 'owner';
  if (normalized === 'admin') return 'admin';
  return 'member';
}

export function RoleProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<any | null>(null);
  const [role, setRole] = useState<Role>('member');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | undefined>(undefined);

  const load = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const {
        data: { user: supaUser },
      } = await supabase.auth.getUser();

      if (!supaUser) {
        router.push('/signin');
        return;
      }

      setUser(supaUser);

      const { data: fetchedProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role, email, name, full_name, avatar_url, bio, timezone, created_at')
        .eq('id', supaUser.id)
        .single();

      let workingProfile = fetchedProfile || null;

      // Legacy metadata fallback (only if profile is completely missing)
      const metaRole = normalizeRole(
        (supaUser.user_metadata as any)?.role ||
          (supaUser.user_metadata as any)?.role_v2 ||
          (supaUser.user_metadata as any)?.adminRole
      );

      if (profileError && profileError.code === 'PGRST116') {
        // Create a profile row safely with member role
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .upsert({
            id: supaUser.id,
            email: supaUser.email,
            role: 'member',
            name: (supaUser.user_metadata as any)?.name || supaUser.email?.split('@')[0] || 'Member',
            full_name:
              (supaUser.user_metadata as any)?.full_name ||
              (supaUser.user_metadata as any)?.name ||
              supaUser.email?.split('@')[0],
          })
          .select()
          .single();

        if (insertError) throw insertError;
        workingProfile = insertedProfile || null;
      } else if (profileError) {
        throw profileError;
      }

      // Ensure role fallback respects database first; only use metadata if no profile exists
      let resolvedRole: Role;
      if (workingProfile) {
        const dbRole = workingProfile.role ? normalizeRole(workingProfile.role) : 'member';
        resolvedRole = dbRole;
        if (!workingProfile.role) {
          await supabase.from('profiles').update({ role: 'member' }).eq('id', supaUser.id);
          workingProfile.role = 'member';
        }
      } else {
        resolvedRole = metaRole || 'member';
      }

      setProfile(workingProfile);
      setRole(resolvedRole);
    } catch (err: any) {
      console.error('RoleProvider error:', err);
      setError(err?.message || 'Failed to load role');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = useMemo<RoleContextValue>(
    () => ({
      user,
      profile,
      role,
      loading,
      error,
      refresh: load,
      hasAdminAccess: role === 'admin' || role === 'owner',
      hasOwnerAccess: role === 'owner',
    }),
    [user, profile, role, loading, error]
  );

  return <RoleContext.Provider value={value}>{children}</RoleContext.Provider>;
}

export function useRole() {
  const ctx = useContext(RoleContext);
  if (!ctx) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return ctx;
}

