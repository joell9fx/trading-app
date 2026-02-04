import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/dashboard/dashboard-layout';

export default async function DashboardAdminPage() {
  const cookieStore = cookies();

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Ignore setAll errors in server components; middleware refreshes sessions.
          }
        },
      },
    }
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    redirect('/signin?redirectTo=/dashboard/admin');
  }

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
  const normalizedRole = profile?.role ? profile.role.toString().toLowerCase() : 'member';
  const hasAdminAccess = normalizedRole === 'admin' || normalizedRole === 'owner';

  if (!hasAdminAccess) {
    redirect('/dashboard');
  }

  return <DashboardLayout initialSection="admin" />;
}
