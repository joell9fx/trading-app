'use client';

import { useEffect, useMemo, useState } from 'react';
import { Trash2, Pin, Flag, Eye, Undo } from 'lucide-react';
import { HubChannelLite } from './ModerationDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ModerationModal from './ModerationModal';
import { createSupabaseClient } from '@/lib/supabase/client';
import { useToast } from '@/hooks/use-toast';

type ModerationMessage = {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  deleted_at?: string | null;
  author_id: string;
  channel_id: string;
  is_pinned?: boolean;
  profiles?: { name?: string | null; email?: string | null; role?: string | null };
};

export default function MessagesPanel({ adminId, channels }: { adminId: string; channels: HubChannelLite[] }) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const { toast } = useToast();

  const [messages, setMessages] = useState<ModerationMessage[]>([]);
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<string>('all');
  const [includeDeleted, setIncludeDeleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ open: boolean; message?: ModerationMessage; context?: ModerationMessage[] }>({
    open: false,
  });

  const loadMessages = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('limit', '120');
      if (search) params.set('q', search);
      if (channelFilter !== 'all') params.set('channel_id', channelFilter);
      if (includeDeleted) params.set('include_deleted', 'true');
      const res = await fetch(`/api/admin/community/messages?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load messages');
      setMessages(data.messages || []);
    } catch (error: any) {
      toast({ title: 'Message load failed', description: error?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [channelFilter, includeDeleted]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadMessages();
    }, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  useEffect(() => {
    const channel = supabase
      .channel('admin-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setMessages((prev) => [payload.new as any, ...prev].slice(0, 150));
        }
        if (payload.eventType === 'UPDATE') {
          setMessages((prev) => prev.map((m) => (m.id === (payload.new as any).id ? ({ ...m, ...payload.new } as any) : m)));
        }
        if (payload.eventType === 'DELETE') {
          setMessages((prev) => prev.filter((m) => m.id !== (payload.old as any).id));
        }
      })
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  const channelLookup = useMemo(() => {
    const map = new Map<string, string>();
    channels.forEach((c) => map.set(c.id, c.name));
    return map;
  }, [channels]);

  const doAction = async (id: string, action: 'delete' | 'restore' | 'pin' | 'unpin' | 'flag') => {
    try {
      const res = await fetch(`/api/admin/community/messages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      toast({ title: 'Updated', description: `Message ${action}d` });
      loadMessages();
    } catch (error: any) {
      toast({ title: 'Action failed', description: error?.message, variant: 'destructive' });
    }
  };

  const openMessage = async (message: ModerationMessage) => {
    try {
      const res = await fetch(`/api/admin/community/messages/${message.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load conversation');
      setModal({ open: true, message: data.message, context: data.context || [] });
    } catch (error: any) {
      toast({ title: 'Load failed', description: error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-3">
      <Card className="bg-gray-950 border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white">Message Moderation</h3>
            <p className="text-sm text-gray-400">Live searchable feed across all channels.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search messages..."
              className="bg-gray-900 border-gray-800 text-gray-100"
            />
            <select
              className="bg-gray-900 border border-gray-800 text-gray-100 rounded-md px-3 py-2"
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
            >
              <option value="all">All channels</option>
              {channels.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 text-sm text-gray-300">
              <input
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => setIncludeDeleted(e.target.checked)}
                className="rounded border-gray-700 bg-gray-900"
              />
              Show deleted
            </label>
            <Button variant="outline" className="border-gray-700 text-gray-200" onClick={loadMessages} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Message</th>
                <th className="px-4 py-3">Channel</th>
                <th className="px-4 py-3">Sender</th>
                <th className="px-4 py-3">Timestamp</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {messages.map((msg) => (
                <tr key={msg.id} className="border-t border-gray-800">
                  <td className="px-4 py-3">
                    <div className="text-white line-clamp-2">{msg.content}</div>
                    <div className="text-xs text-gray-500">{msg.id}</div>
                    {msg.is_pinned ? <Badge className="mt-1 bg-amber-500 text-black">Pinned</Badge> : null}
                    {msg.deleted_at ? <Badge className="mt-1 bg-red-500 text-white">Deleted</Badge> : null}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="secondary" className="bg-gray-900 border-gray-800 text-gray-200">
                      {channelLookup.get(msg.channel_id) || 'Channel'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">
                      {msg.profiles?.name || msg.profiles?.email || msg.author_id}
                    </div>
                    <div className="text-xs text-gray-500">{msg.profiles?.role}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{new Date(msg.created_at).toLocaleString()}</td>
                  <td className="px-4 py-3 space-x-2">
                    <Button size="sm" variant="outline" className="border-gray-700 text-gray-200" onClick={() => openMessage(msg)}>
                      <Eye className="h-4 w-4 mr-1" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-gray-700 text-gray-200"
                      onClick={() => doAction(msg.id, msg.is_pinned ? 'unpin' : 'pin')}
                    >
                      <Pin className="h-4 w-4 mr-1" />
                      {msg.is_pinned ? 'Unpin' : 'Pin'}
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-700 text-gray-200" onClick={() => doAction(msg.id, 'flag')}>
                      <Flag className="h-4 w-4 mr-1" />
                      Flag
                    </Button>
                    {msg.deleted_at ? (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => doAction(msg.id, 'restore')}>
                        <Undo className="h-4 w-4 mr-1" />
                        Restore
                      </Button>
                    ) : (
                      <Button size="sm" className="bg-red-600 hover:bg-red-500" onClick={() => doAction(msg.id, 'delete')}>
                        <Trash2 className="h-4 w-4 mr-1" />
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
              {!messages.length && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-gray-500">
                    {loading ? 'Loading messages...' : 'No messages found.'}
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
        title="Conversation"
        description={modal.message?.id}
      >
        {modal.message ? (
          <div className="space-y-3">
            <div className="text-sm text-gray-300">{modal.message.content}</div>
            <div className="space-y-2 bg-gray-900 border border-gray-800 rounded-md p-3">
              <p className="text-xs text-gray-500 uppercase">Recent in channel</p>
              {modal.context?.map((m) => (
                <div key={m.id} className="text-sm text-gray-200 border-b border-gray-800 last:border-0 pb-2 last:pb-0">
                  <span className="text-xs text-gray-500">{new Date(m.created_at).toLocaleTimeString()} • </span>
                  {m.content}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-gray-500 text-sm">Select a message to view details.</div>
        )}
      </ModerationModal>
    </div>
  );
}

