import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import DiagnosticsButton from '@/components/diagnostics/DiagnosticsButton';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';

export default async function AdminToolsPage() {
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
            // ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/signin');

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();

  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  const hubUser = {
    id: user.id,
    email: user.email,
    name: (profile as any)?.name,
    full_name: (profile as any)?.full_name,
    avatar_url: (profile as any)?.avatar_url,
    role: (profile as any)?.role || 'ADMIN',
  };

  return (
    <div className="min-h-screen bg-page">
      <div className="max-w-4xl mx-auto px-4 py-10 space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Tools</h1>
        <Card className="p-4 bg-panel border border-border">
          <h2 className="text-lg font-semibold text-foreground mb-2">Chat Diagnostics</h2>
          <p className="text-sm text-muted-foreground mb-4">
            Run a full send + realtime diagnostic. Visible only in non-production or admin context.
          </p>
          <DiagnosticsButton user={hubUser as any} />
        </Card>
      </div>
    </div>
  );
}

