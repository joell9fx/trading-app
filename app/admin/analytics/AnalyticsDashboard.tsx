'use client';

import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import KpiCards from './KpiCards';
import ChartsSection from './ChartsSection';
import ModerationLog from './ModerationLog';
import AiInsightsPanel from './AiInsightsPanel';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Activity, AlertTriangle, BarChart3, MessageSquare, Radio, ShieldBan, Users } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type AdminInfo = {
  id: string;
  name?: string | null;
  email?: string | null;
};

type OverviewData = {
  metrics: {
    totalUsers: number;
    messagesWindow: number;
    activeChannels: number;
    bans7d: number;
    pendingReports: number;
    activeUsersOnline: number;
    rangeDays: number;
  };
  charts: {
    messagesOverTime: { day: string; message_count: number; unique_authors?: number }[];
    topChannels: { channel_name: string; message_count: number }[];
    moderationSummary: { action_type: string; action_count: number }[];
    activeUsers: { day: string; active_users: number }[];
  };
};

const ranges = [
  { label: '7d', value: '7' },
  { label: '30d', value: '30' },
  { label: 'All', value: 'all' },
];

export default function AnalyticsDashboard({ admin }: { admin: AdminInfo }) {
  const { toast } = useToast();
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [loading, setLoading] = useState(false);
  const [range, setRange] = useState('30');

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/analytics/overview?range=${range}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load analytics');
      setOverview(data);
    } catch (error: any) {
      toast({ title: 'Analytics error', description: error?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  useEffect(() => {
    const channel = supabase
      .channel('analytics-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moderation_actions' }, () => loadOverview())
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => loadOverview())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]); // eslint-disable-line react-hooks/exhaustive-deps

  const metrics = overview?.metrics;

  return (
    <div className="space-y-5">
      <Card className="bg-gray-950 border border-gray-800 p-4">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-2 text-gray-100">
            <BarChart3 className="h-5 w-5 text-amber-400" />
            <div>
              <p className="text-xs uppercase tracking-wide text-gray-500">Analytics</p>
              <h3 className="text-lg font-semibold">Moderation Impact & Activity</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {ranges.map((r) => (
              <Button
                key={r.value}
                variant={range === r.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setRange(r.value)}
                className={range === r.value ? 'bg-blue-600 text-white' : 'border-gray-700 text-gray-200'}
              >
                {r.label}
              </Button>
            ))}
            <Button variant="outline" size="sm" onClick={loadOverview} disabled={loading} className="border-gray-700 text-gray-200">
              Refresh
            </Button>
          </div>
        </div>
      </Card>

      {metrics ? (
        <KpiCards
          items={[
            { label: 'Total Users', value: metrics.totalUsers, icon: <Users className="h-5 w-5" />, accent: 'blue' },
            {
              label: `Messages (${metrics.rangeDays}d)`,
              value: metrics.messagesWindow,
              icon: <MessageSquare className="h-5 w-5" />,
              accent: 'gold',
            },
            { label: 'Active Channels', value: metrics.activeChannels, icon: <Radio className="h-5 w-5" />, accent: 'blue' },
            { label: 'Bans (7d)', value: metrics.bans7d, icon: <ShieldBan className="h-5 w-5" />, accent: 'red' },
            {
              label: 'Pending Reports',
              value: metrics.pendingReports,
              helper: `${metrics.activeUsersOnline} online now`,
              icon: <AlertTriangle className="h-5 w-5" />,
              accent: 'gold',
            },
          ]}
        />
      ) : null}

      <AiInsightsPanel />

      {overview ? (
        <ChartsSection
          messagesOverTime={overview.charts.messagesOverTime}
          topChannels={overview.charts.topChannels}
          moderationSummary={overview.charts.moderationSummary}
        />
      ) : null}

      <Card className="bg-gray-950 border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs uppercase text-gray-500">Engagement</p>
            <h3 className="text-lg font-semibold text-white">Active users trend</h3>
          </div>
          <Badge className="bg-gray-900 border border-gray-800 text-gray-200">
            Last {metrics?.rangeDays ?? 30} days
          </Badge>
        </div>
        <div className="text-sm text-gray-400">
          Active users per day: {overview?.charts.activeUsers.slice(-7).reduce((sum, d) => sum + d.active_users, 0) ?? 0} users (last 7 records)
        </div>
      </Card>

      <ModerationLog />
    </div>
  );
}

