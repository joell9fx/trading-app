import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import CommunityHub from '@/components/community-hub/community-hub';

export const dynamic = 'force-dynamic';

export default async function CommunityHubPage() {
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
            // ignore setAll from server component
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin');
  }

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  const hubUser = {
    id: user.id,
    email: user.email,
    name: (profile as any)?.name,
    full_name: (profile as any)?.full_name,
    avatar_url: (profile as any)?.avatar_url,
    role: (profile as any)?.role || 'MEMBER',
  };

  return (
    <div className="min-h-screen bg-black">
      <div className="max-w-7xl mx-auto px-4 py-10">
        <CommunityHub user={hubUser} />
      </div>
    </div>
  );
}

