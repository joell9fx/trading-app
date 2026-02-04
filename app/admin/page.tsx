import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Users, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { assertAdmin } from '@/utils/auth';

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
  return (
    <div className="container mx-auto px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome to your Trading Academy administration panel. Manage courses, users, and monitor platform performance.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +180 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Course Completion</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground">
              +5% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24.5h</div>
            <p className="text-xs text-muted-foreground">
              +3.2h from last month
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
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New course published</p>
                <p className="text-xs text-gray-500">Technical Analysis Mastery was published 2 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">New user registration</p>
                <p className="text-xs text-gray-500">John Doe joined the platform 4 hours ago</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Course completion</p>
                <p className="text-xs text-gray-500">Sarah completed Introduction to Trading Fundamentals</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
