import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AnalyticsDashboard from './AnalyticsDashboard';

export default async function AdminAnalyticsPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/signin?redirectTo=/admin/analytics');
  }

  const { data: profile } = await supabase.from('profiles').select('role, name, email').eq('id', user.id).single();
  if (profile?.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
        <h1 className="text-3xl font-bold text-gray-900">Community Analytics</h1>
        <p className="text-gray-600 mt-1">
          Visualize moderation impact, chat activity, and engagement trends across the Community Hub.
        </p>
      </div>
      <AnalyticsDashboard admin={{ id: user.id, name: profile?.name, email: profile?.email }} />
    </div>
  );
}


