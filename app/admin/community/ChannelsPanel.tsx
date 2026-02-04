'use client';

import { useState } from 'react';
import { HubChannelLite } from './ModerationDashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import ModerationModal from './ModerationModal';
import { useToast } from '@/hooks/use-toast';
import { Pencil, Archive, PlusCircle } from 'lucide-react';

const categories = ['general', 'forex', 'crypto', 'signals', 'mentorship', 'announcements'];

export default function ChannelsPanel({
  adminId,
  channels,
  onRefresh,
  loading,
}: {
  adminId: string;
  channels: HubChannelLite[];
  onRefresh: () => void;
  loading: boolean;
}) {
  const { toast } = useToast();
  const [newChannel, setNewChannel] = useState({ name: '', description: '', category: 'general', is_private: false });
  const [editState, setEditState] = useState<{ open: boolean; channel?: HubChannelLite }>({ open: false });
  const [editData, setEditData] = useState({ name: '', description: '', category: 'general', is_private: false, archived: false });

  const createChannel = async () => {
    try {
      const res = await fetch('/api/admin/community/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newChannel),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create channel');
      toast({ title: 'Channel created', description: data.channel?.name });
      setNewChannel({ name: '', description: '', category: 'general', is_private: false });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Create failed', description: error?.message, variant: 'destructive' });
    }
  };

  const openEdit = (channel: HubChannelLite) => {
    setEditData({
      name: channel.name,
      description: (channel as any).description || '',
      category: channel.category || 'general',
      is_private: !!channel.is_private,
      archived: !!channel.archived_at,
    });
    setEditState({ open: true, channel });
  };

  const saveEdit = async () => {
    if (!editState.channel) return;
    try {
      const res = await fetch(`/api/admin/community/channels/${editState.channel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      toast({ title: 'Channel updated', description: data.channel?.name });
      setEditState({ open: false });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Update failed', description: error?.message, variant: 'destructive' });
    }
  };

  const archiveChannel = async (channelId: string) => {
    try {
      const res = await fetch(`/api/admin/community/channels/${channelId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Archive failed');
      toast({ title: 'Archived', description: 'Channel archived' });
      onRefresh();
    } catch (error: any) {
      toast({ title: 'Archive failed', description: error?.message, variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-4">
      <Card className="bg-gray-950 border border-gray-800 p-4 space-y-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Create Channel</h3>
          <p className="text-sm text-gray-400">Add a new discussion space.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Name</Label>
            <Input
              value={newChannel.name}
              onChange={(e) => setNewChannel((c) => ({ ...c, name: e.target.value }))}
              placeholder="Orderflow Lab"
              className="bg-gray-900 border-gray-800 text-gray-100"
            />
          </div>
          <div className="space-y-1 md:col-span-2">
            <Label className="text-xs text-gray-400">Description</Label>
            <Input
              value={newChannel.description}
              onChange={(e) => setNewChannel((c) => ({ ...c, description: e.target.value }))}
              placeholder="What is this channel about?"
              className="bg-gray-900 border-gray-800 text-gray-100"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-gray-400">Category</Label>
            <select
              className="w-full bg-gray-900 border border-gray-800 text-gray-100 rounded-md px-3 py-2"
              value={newChannel.category}
              onChange={(e) => setNewChannel((c) => ({ ...c, category: e.target.value }))}
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={newChannel.is_private}
              onChange={(e) => setNewChannel((c) => ({ ...c, is_private: e.target.checked }))}
              className="rounded border-gray-700 bg-gray-900"
            />
            Private channel
          </label>
          <Button onClick={createChannel} disabled={!newChannel.name.trim()}>
            <PlusCircle className="h-4 w-4 mr-1" />
            Create
          </Button>
        </div>
      </Card>

      <Card className="bg-gray-950 border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Channels</h3>
          <Button variant="outline" className="border-gray-700 text-gray-200" onClick={onRefresh} disabled={loading}>
            Refresh
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="bg-gray-900 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Created</th>
                <th className="px-4 py-3">Members</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((channel) => (
                <tr key={channel.id} className="border-t border-gray-800">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-white">{channel.name}</div>
                    <div className="text-xs text-gray-500">{(channel as any).description}</div>
                  </td>
                  <td className="px-4 py-3 capitalize">{channel.category}</td>
                  <td className="px-4 py-3 text-gray-400">
                    {(channel as any).created_at ? new Date((channel as any).created_at).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-4 py-3">{(channel as any).member_count ?? '—'}</td>
                  <td className="px-4 py-3">
                    {channel.archived_at ? 'Archived' : channel.is_private ? 'Private' : 'Public'}
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <Button variant="outline" size="sm" className="border-gray-700 text-gray-200" onClick={() => openEdit(channel)}>
                      <Pencil className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" className="bg-red-600 hover:bg-red-500" onClick={() => archiveChannel(channel.id)}>
                      <Archive className="h-4 w-4 mr-1" />
                      Archive
                    </Button>
                  </td>
                </tr>
              ))}
              {!channels.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    {loading ? 'Loading channels...' : 'No channels available.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ModerationModal
        open={editState.open}
        onClose={() => setEditState({ open: false })}
        onConfirm={saveEdit}
        title="Edit Channel"
        confirmText="Save"
      >
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Name</Label>
          <Input
            value={editData.name}
            onChange={(e) => setEditData((d) => ({ ...d, name: e.target.value }))}
            className="bg-gray-900 border-gray-800 text-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Description</Label>
          <Input
            value={editData.description}
            onChange={(e) => setEditData((d) => ({ ...d, description: e.target.value }))}
            className="bg-gray-900 border-gray-800 text-gray-100"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-gray-400">Category</Label>
          <select
            className="w-full bg-gray-900 border border-gray-800 text-gray-100 rounded-md px-3 py-2"
            value={editData.category}
            onChange={(e) => setEditData((d) => ({ ...d, category: e.target.value }))}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={editData.is_private}
            onChange={(e) => setEditData((d) => ({ ...d, is_private: e.target.checked }))}
            className="rounded border-gray-700 bg-gray-900"
          />
          Private
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={editData.archived}
            onChange={(e) => setEditData((d) => ({ ...d, archived: e.target.checked }))}
            className="rounded border-gray-700 bg-gray-900"
          />
          Archived
        </label>
      </ModerationModal>
    </div>
  );
}

