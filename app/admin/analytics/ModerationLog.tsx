'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { createSupabaseClient } from '@/lib/supabase/client';
import { Download, RefreshCw, Search } from 'lucide-react';

type ModerationAction = {
  id: string;
  action_type: string;
  reason?: string | null;
  created_at: string;
  admin_id?: string | null;
  user_id?: string | null;
  message_id?: string | null;
  channel?: { name?: string | null; slug?: string | null } | null;
  admin?: { name?: string | null; email?: string | null } | null;
  user?: { name?: string | null; email?: string | null } | null;
  metadata?: any;
};

export default function ModerationLog() {
  const { toast } = useToast();
  const supabase = useMemo(() => createSupabaseClient(), []);
  const [actions, setActions] = useState<ModerationAction[]>([]);
  const [page, setPage] = useState(1);
  const [limit] = useState(50);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ q: '', action_type: '', from: '', to: '' });

  const loadActions = async (nextPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', `${nextPage}`);
      params.set('limit', `${limit}`);
      if (filters.q) params.set('q', filters.q);
      if (filters.action_type) params.set('action_type', filters.action_type);
      if (filters.from) params.set('from', filters.from);
      if (filters.to) params.set('to', filters.to);
      const res = await fetch(`/api/admin/analytics/moderation-log?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load log');
      setActions(data.actions || []);
      setTotal(data.total || 0);
      setPage(nextPage);
    } catch (error: any) {
      toast({ title: 'Load failed', description: error?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActions(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.action_type, filters.from, filters.to]);

  useEffect(() => {
    const channel = supabase
      .channel('moderation-log-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'moderation_actions' }, (payload) => {
        setActions((prev) => [payload.new as any, ...prev].slice(0, limit));
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, limit]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const exportCsv = async () => {
    try {
      const params = new URLSearchParams();
      params.set('format', 'csv');
      const res = await fetch(`/api/admin/analytics/moderation-log?${params.toString()}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'moderation-log.csv';
      a.click();
      window.URL.revokeObjectURL(url);
      toast({ title: 'Export ready', description: 'CSV downloaded' });
    } catch (error: any) {
      toast({ title: 'Export failed', description: error?.message, variant: 'destructive' });
    }
  };

  return (
    <Card className="bg-gray-950 border border-gray-800">
      <div className="p-4 border-b border-gray-800 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-gray-500">Moderation</p>
          <h3 className="text-lg font-semibold text-white">Moderation log</h3>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="relative">
            <Search className="h-4 w-4 text-gray-500 absolute left-3 top-3" />
            <Input
              className="pl-9 bg-gray-900 border-gray-800 text-gray-100"
              placeholder="Search user, admin, reason"
              value={filters.q}
              onChange={(e) => setFilters((f) => ({ ...f, q: e.target.value }))}
              onKeyDown={(e) => {
                if (e.key === 'Enter') loadActions(1);
              }}
            />
          </div>
          <select
            className="bg-gray-900 border border-gray-800 text-gray-100 rounded-md px-3 py-2"
            value={filters.action_type}
            onChange={(e) => setFilters((f) => ({ ...f, action_type: e.target.value }))}
          >
            <option value="">All actions</option>
            <option value="ban">Ban</option>
            <option value="unban">Unban</option>
            <option value="mute">Mute</option>
            <option value="unmute">Unmute</option>
            <option value="delete">Delete message</option>
            <option value="restore">Restore message</option>
            <option value="pin">Pin</option>
            <option value="unpin">Unpin</option>
            <option value="flag">Flag</option>
            <option value="change_role">Change role</option>
          </select>
          <Input
            type="date"
            className="bg-gray-900 border-gray-800 text-gray-100"
            value={filters.from}
            onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
          />
          <Input
            type="date"
            className="bg-gray-900 border-gray-800 text-gray-100"
            value={filters.to}
            onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
          />
          <Button variant="outline" className="border-gray-700 text-gray-200" onClick={() => loadActions(1)} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh
          </Button>
          <Button onClick={exportCsv} className="bg-blue-600 hover:bg-blue-500">
            <Download className="h-4 w-4 mr-1" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-left text-gray-300">
          <thead className="bg-gray-900 text-xs uppercase text-gray-500">
            <tr>
              <th className="px-4 py-3">Timestamp</th>
              <th className="px-4 py-3">Admin</th>
              <th className="px-4 py-3">Action</th>
              <th className="px-4 py-3">Target User</th>
              <th className="px-4 py-3">Message</th>
              <th className="px-4 py-3">Channel</th>
              <th className="px-4 py-3">Reason</th>
            </tr>
          </thead>
          <tbody>
            {actions.map((action) => (
              <tr key={action.id} className="border-t border-gray-800">
                <td className="px-4 py-3 text-gray-400">{new Date(action.created_at).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{action.admin?.name || action.admin?.email || action.admin_id}</div>
                </td>
                <td className="px-4 py-3 capitalize">{action.action_type}</td>
                <td className="px-4 py-3">
                  <div className="text-white">{action.user?.name || action.user?.email || action.user_id || '—'}</div>
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{action.message_id || '—'}</td>
                <td className="px-4 py-3">{action.channel?.name || action.channel?.slug || '—'}</td>
                <td className="px-4 py-3 text-gray-300">{action.reason || '—'}</td>
              </tr>
            ))}
            {!actions.length && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-gray-500">
                  {loading ? 'Loading moderation actions...' : 'No moderation actions yet.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 border-t border-gray-800 flex items-center justify-between text-sm text-gray-400">
        <div>
          Page {page} of {totalPages} — {total} records
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-200"
            disabled={page <= 1}
            onClick={() => loadActions(page - 1)}
          >
            Prev
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-700 text-gray-200"
            disabled={page >= totalPages}
            onClick={() => loadActions(page + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </Card>
  );
}

