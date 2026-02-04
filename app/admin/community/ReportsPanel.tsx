'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { FileWarning, CheckCircle2, XCircle, Trash2 } from 'lucide-react';
import { HubChannelLite } from './ModerationDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import ModerationModal from './ModerationModal';
import { createSupabaseClient } from '@/lib/supabase/client';

type Report = {
  id: string;
  status: string;
  reason?: string | null;
  created_at: string;
  reporter_id?: string | null;
  message?: {
    id: string;
    content: string;
    channel_id: string;
    author_id: string;
    created_at: string;
    profiles?: { name?: string | null; email?: string | null };
  } | null;
};

export default function ReportsPanel({ adminId, channels }: { adminId: string; channels: HubChannelLite[] }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const { toast } = useToast();
  const [reports, setReports] = useState<Report[]>([]);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; report?: Report }>({ open: false });

  const channelLookup = useMemo(() => {
    const map = new Map<string, string>();
    channels.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [channels]);

  const loadReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/community/reports?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load reports');
      setReports(data.reports || []);
    } catch (error: any) {
      toast({ title: 'Report load failed', description: error?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-reports')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, () => {
        loadReports();
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [loadReports, supabase]);

  const act = async (report: Report, action: 'review' | 'dismiss' | 'remove') => {
    try {
      const res = await fetch(`/api/admin/community/reports/${report.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      toast({ title: 'Updated', description: `Report ${action}ed` });
      loadReports();
    } catch (error: any) {
      toast({ title: 'Action failed', description: error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-950 border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Reports & Flagged Content</h3>
            <p className="text-sm text-gray-400">Review flagged messages and take action.</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              className="bg-gray-900 border border-gray-800 text-gray-100 rounded-md px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="dismissed">Dismissed</option>
              <option value="removed">Removed</option>
            </select>
            <Button variant="outline" className="border-gray-700 text-gray-200" onClick={loadReports} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Report</th>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id} className="border-t border-gray-800">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500 text-black">
                        <FileWarning className="h-4 w-4 mr-1" />
                        {report.status}
                      </Badge>
                      <span className="text-xs text-gray-500">{report.id}</span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{report.reason || 'No reason provided'}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-white line-clamp-2">{report.message?.content}</div>
                    <div className="text-xs text-gray-500">{report.message?.author_id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="bg-gray-900 border-gray-800 text-gray-200">
                      {channelLookup.get(report.message?.channel_id || '') || 'Channel'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(report.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 space-x-2">
                    <Button size="sm" variant="outline" className="border-gray-700 text-gray-200" onClick={() => setModal({ open: true, report })}>
                      View
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-500" onClick={() => act(report, 'review')}>
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Review
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-700 text-gray-200" onClick={() => act(report, 'dismiss')}>
                      <XCircle className="h-4 w-4 mr-1" />
                      Dismiss
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-500" onClick={() => act(report, 'remove')}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
              {!reports.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    {loading ? 'Loading reports...' : 'No reports for this filter.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ModerationModal
        open={modal.open}
        onClose={() => setModal({ open: false })}
        title="Report details"
        description={modal.report?.id}
        confirmText="Close"
      >
        <div className="space-y-2">
          <p className="text-sm text-gray-300">{modal.report?.message?.content}</p>
          <p className="text-xs text-gray-400">
            Reporter: {modal.report?.reporter_id || 'unknown'} | Channel:{' '}
            {channelLookup.get(modal.report?.message?.channel_id || '') || 'channel'}
          </p>
          <Badge className="bg-amber-500 text-black">{modal.report?.status}</Badge>
        </div>
      </ModerationModal>
    </div>
  );
}

