import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Users, TrendingUp, UserPlus, ShieldAlert } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/utils/auth';
import { getLaunchReadinessSnapshot } from '@/lib/admin/launch-readiness-snapshot';

export default async function AdminDashboardPage() {
  // Server-side authentication and authorization check
  // (Middleware also protects this route, but this provides additional security)
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/signin?redirectTo=/admin');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_admin, is_owner, banned')
    .eq('id', user.id)
    .single();

  if (!profile) {
    redirect('/dashboard');
  }

  try {
    assertAdmin(profile);
  } catch {
    redirect('/dashboard');
  }

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();

  const [launchReadiness, coursesRes, usersRes, profilesLast7dRes, unlockedRes, recentUsersRes] =
    await Promise.all([
      getLaunchReadinessSnapshot(supabase),
      supabase.from('courses').select('id', { count: 'exact', head: true }),
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgo),
      supabase
        .from('user_services')
        .select('service_key, unlocked_at')
        .eq('is_unlocked', true)
        .gte('unlocked_at', sevenDaysAgo),
      supabase
        .from('profiles')
        .select('email, created_at')
        .order('created_at', { ascending: false })
        .limit(3),
    ]);

  const unlockedLast7d = unlockedRes.data?.length ?? 0;
  const newProfilesLast7d = profilesLast7dRes.count ?? 0;

  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Welcome to your Trading Academy administration panel. Manage courses, users, and monitor platform performance.
        </p>
      </div>

      <Card className="mb-8 border-dashed">
        <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
          <div className="space-y-1">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ShieldAlert className="h-5 w-5" />
              Launch readiness
            </CardTitle>
            <CardDescription>
              Stripe, webhook, site URL, paid price env keys, and critical database tables. Blocked means
              checkout or automatic unlocks may fail until resolved.
            </CardDescription>
          </div>
          <Badge
            variant={launchReadiness.summary.status === 'degraded' ? 'secondary' : 'default'}
            className={
              launchReadiness.summary.status === 'blocked'
                ? 'border-red-600 bg-red-950 text-red-200'
                : undefined
            }
          >
            {launchReadiness.summary.launchReady
              ? launchReadiness.summary.status === 'degraded'
                ? 'Ready (warnings)'
                : 'Launch ready'
              : 'Not launch ready'}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {launchReadiness.summary.blockers.length > 0 && (
            <div>
              <p className="text-sm font-medium text-destructive mb-2">Blockers</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                {launchReadiness.summary.blockers.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}
          {launchReadiness.summary.warnings.length > 0 && (
            <div>
              <p className="text-sm font-medium mb-2">Warnings</p>
              <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1 max-h-40 overflow-y-auto">
                {launchReadiness.summary.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          {launchReadiness.summary.blockers.length === 0 &&
            launchReadiness.summary.warnings.length === 0 && (
              <p className="text-sm text-muted-foreground">All critical checks passed.</p>
            )}
          <div className="flex flex-wrap gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <a href="/api/admin/launch-readiness" target="_blank" rel="noopener noreferrer">
                Open JSON report
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{coursesRes.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              Published + draft courses
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersRes.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">
              +{newProfilesLast7d} new profiles in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid unlocks (7d)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unlockedLast7d}</div>
            <p className="text-xs text-muted-foreground">
              Distinct service unlock events recorded in the last 7 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New profiles (7d)</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{newProfilesLast7d}</div>
            <p className="text-xs text-muted-foreground">
              Accounts created in the rolling last 7 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Course Management</CardTitle>
            <CardDescription>
              Create, edit, and manage your trading courses
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/courses" className="w-full">
              <Button className="w-full">
                <BookOpen className="w-4 h-4 mr-2" />
                Manage Courses
              </Button>
            </Link>
            <Link href="/admin/courses/create" className="w-full">
              <Button variant="outline" className="w-full">
                Create New Course
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>User Management</CardTitle>
            <CardDescription>
              Monitor user activity and manage accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/users" className="w-full">
              <Button className="w-full">
                <Users className="w-4 h-4 mr-2" />
                View Users
              </Button>
            </Link>
            <Button variant="outline" className="w-full" disabled>
              User Analytics
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Platform Analytics</CardTitle>
            <CardDescription>
              Track platform performance and user engagement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Link href="/admin/analytics" className="w-full">
              <Button className="w-full">
                <TrendingUp className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </Link>
            <Button variant="outline" className="w-full" disabled>
              Export Reports
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            Latest updates and activities in your academy
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(recentUsersRes.data ?? []).map((u, idx) => (
              <div key={`${u.email}-${idx}`} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New user registration</p>
                  <p className="text-xs text-gray-500">
                    {u.email || 'Unknown email'} joined on {u.created_at ? new Date(u.created_at).toLocaleString() : 'unknown date'}
                  </p>
                </div>
              </div>
            ))}
            {(recentUsersRes.data ?? []).length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity available yet.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
