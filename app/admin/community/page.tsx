import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ModerationDashboard from './ModerationDashboard';

export default async function CommunityModerationPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?redirectTo=/admin/community');
  }

  const { data: profile } = await supabase.from('profiles').select('role, name, email').eq('id', user.id).single();

  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
        <h1 className="text-3xl font-bold text-gray-900">Community Moderation</h1>
        <p className="text-gray-600 mt-1">
          Monitor chat activity, resolve reports, and keep the Community Hub safe in real time.
        </p>
      </div>
      <ModerationDashboard admin={{ id: user.id, name: profile?.name, email: profile?.email }} />
    </div>
  );
}

