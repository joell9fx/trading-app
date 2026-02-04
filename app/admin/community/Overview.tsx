'use client';

import { useEffect, useMemo, useState } from 'react';
import { Users, MessageSquare, Radio, Eye, FileWarning } from 'lucide-react';
import StatsCard from './StatsCard';
import { HubChannelLite } from './ModerationDashboard';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

type OverviewMetrics = {
  totalUsers: number;
  activeChannels: number;
  messagesToday: number;
  activeUsersOnline: number;
  pendingReports: number;
};

type RecentMessage = {
  id: string;
  content: string;
  created_at: string;
  channel_id: string;
  author_id: string;
  profiles?: { name?: string | null; email?: string | null };
};

export default function Overview({ adminId, channels }: { adminId: string; channels: HubChannelLite[] }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const { toast } = useToast();

  const [metrics, setMetrics] = useState<OverviewMetrics>({
    totalUsers: 0,
    activeChannels: 0,
    messagesToday: 0,
    activeUsersOnline: 0,
    pendingReports: 0,
  });
  const [recentMessages, setRecentMessages] = useState<RecentMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const channelLookup = useMemo(() => {
    const map = new Map<string, string>();
    channels.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [channels]);

  const loadOverview = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/community/overview');
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to load overview');
      }
      setMetrics(data.metrics);
      setRecentMessages(data.recentMessages || []);
    } catch (error: any) {
      toast({ title: 'Overview error', description: error?.message || 'Unable to load metrics', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('admin-overview')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages' },
        (payload) => {
          const msg = payload.new as any;
          setRecentMessages((prev) => {
            const next = [{ ...msg }, ...prev].slice(0, 25);
            return next;
          });
          setMetrics((prev) => ({ ...prev, messagesToday: prev.messagesToday + 1 }));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMetrics((prev) => ({ ...prev, pendingReports: prev.pendingReports + 1 }));
          } else if (payload.eventType === 'UPDATE') {
            const newStatus = (payload.new as any)?.status;
            const oldStatus = (payload.old as any)?.status;
            if (oldStatus === 'pending' && newStatus !== 'pending') {
              setMetrics((prev) => ({ ...prev, pendingReports: Math.max(0, prev.pendingReports - 1) }));
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatsCard label="Total Users" value={metrics.totalUsers} helper="All profiles" icon={<Users className="h-5 w-5" />} />
        <StatsCard
          label="Active Channels"
          value={metrics.activeChannels}
          helper="Community Hub"
          icon={<Radio className="h-5 w-5" />}
          accent="gold"
        />
        <StatsCard
          label="Messages Today"
          value={metrics.messagesToday}
          helper="Last 24h"
          icon={<MessageSquare className="h-5 w-5" />}
        />
        <StatsCard
          label="Active Users Online"
          value={metrics.activeUsersOnline}
          helper="Past 15 min activity"
          icon={<Eye className="h-5 w-5" />}
        />
        <StatsCard
          label="Pending Reports"
          value={metrics.pendingReports}
          helper="Needs review"
          icon={<FileWarning className="h-5 w-5" />}
          accent="gold"
        />
      </div>

      <Card className="bg-gray-950 border border-gray-800">
        <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Live feed</p>
            <h3 className="text-lg font-semibold text-white">Recent messages</h3>
          </div>
          {loading ? <span className="text-xs text-gray-400">Refreshing...</span> : null}
        </div>
        <div className="divide-y divide-gray-800">
          {recentMessages.length === 0 ? (
            <div className="px-4 py-6 text-gray-500 text-sm">No messages yet.</div>
          ) : (
            recentMessages.map((msg) => (
              <div key={msg.id} className="px-4 py-3 flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-gray-900 border-gray-800 text-gray-200">
                      {channelLookup.get(msg.channel_id) || 'Channel'}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {new Date(msg.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-white mt-1 line-clamp-2">{msg.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {msg.profiles?.name || msg.profiles?.email || 'Unknown user'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}

