'use client';

import { useEffect, useState } from 'react';
import { ShieldBan, VolumeX, ShieldCheck, Crown } from 'lucide-react';
import ModerationModal from './ModerationModal';
import ActionButtons from './ActionButtons';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

type ModerationUser = {
  id: string;
  email?: string;
  name?: string;
  full_name?: string;
  role: string;
  status: 'active' | 'banned' | 'muted';
  created_at?: string;
  last_active?: string;
  ban?: any;
  mute?: any;
};

const roleOptions = ['ALL', 'VIEWER', 'MEMBER', 'TRADER', 'MODERATOR', 'ADMIN'];
const statusOptions = ['all', 'active', 'muted', 'banned'];

export default function UsersPanel({ adminId }: { adminId: string }) {
  const { toast } = useToast();
  const [users, setUsers] = useState<ModerationUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ role: 'ALL', status: 'all' });
  const [modalState, setModalState] = useState<{
    open: boolean;
    action?: 'mute' | 'ban' | 'unban' | 'unmute' | 'role';
    user?: ModerationUser;
  }>({ open: false });
  const [reason, setReason] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(60);
  const [nextRole, setNextRole] = useState<string>('MEMBER');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.role !== 'ALL') params.set('role', filters.role);
      if (filters.status !== 'all') params.set('status', filters.status);
      const res = await fetch(`/api/admin/community/users?${params.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load users');
      setUsers(data.users || []);
    } catch (error: any) {
      toast({ title: 'User load failed', description: error?.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const openModal = (user: ModerationUser, action: any) => {
    setReason('');
    setDurationMinutes(60);
    setNextRole(user.role);
    setModalState({ open: true, user, action });
  };

  const performAction = async () => {
    if (!modalState.user || !modalState.action) return;
    try {
      const res = await fetch(`/api/admin/community/users/${modalState.user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: modalState.action,
          reason,
          durationMinutes: durationMinutes || undefined,
          role: modalState.action === 'role' ? nextRole : undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      toast({ title: 'Success', description: `Action ${modalState.action} applied.` });
      setModalState({ open: false });
      loadUsers();
    } catch (error: any) {
      toast({ title: 'Action failed', description: error?.message, variant: 'destructive' });
    }
  };

  const actionLabel = modalState.action === 'mute'
    ? 'Mute user'
    : modalState.action === 'ban'
    ? 'Ban user'
    : modalState.action === 'unban'
    ? 'Unban user'
    : modalState.action === 'unmute'
    ? 'Unmute user'
    : 'Change role';

  return (
    <div className="space-y-3">
      <Card className="bg-panel border border-border">
        <div className="p-4 border-b border-border flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-foreground">User Management</h3>
            <p className="text-sm text-muted-foreground">Mute, ban, and promote members.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Role</Label>
              <select
                className="bg-panel border border-border text-foreground rounded-md px-3 py-2"
                value={filters.role}
                onChange={(e) => setFilters((f) => ({ ...f, role: e.target.value }))}
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Status</Label>
              <select
                className="bg-panel border border-border text-foreground rounded-md px-3 py-2"
                value={filters.status}
                onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <Button variant="outline" className="border-border text-foreground/90" onClick={loadUsers} disabled={loading}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-foreground/80">
            <thead className="bg-elevated text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Username</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">Last Active</th>
                <th className="px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-border">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-foreground">{user.name || user.full_name || user.email}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </td>
                  <td className="px-4 py-3">{user.role}</td>
                  <td className="px-4 py-3 capitalize">
                    {user.status === 'active' ? '🟢 Active' : user.status === 'banned' ? '🔴 Banned' : '🔇 Muted'}
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {user.last_active ? new Date(user.last_active).toLocaleString() : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <ActionButtons>
                      <Button variant="outline" size="sm" className="border-border text-foreground/90" onClick={() => openModal(user, 'mute')}>
                        <VolumeX className="h-4 w-4 mr-1" />
                        Mute
                      </Button>
                      <Button variant="outline" size="sm" className="border-border text-foreground/90" onClick={() => openModal(user, 'ban')}>
                        <ShieldBan className="h-4 w-4 mr-1" />
                        Ban
                      </Button>
                      {user.status === 'banned' ? (
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500" onClick={() => openModal(user, 'unban')}>
                          Unban
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline" className="border-border text-foreground/90" onClick={() => openModal(user, 'unmute')}>
                          Unmute
                        </Button>
                      )}
                      <Button variant="outline" size="sm" className="border-border text-foreground/90" onClick={() => openModal(user, 'role')}>
                        <Crown className="h-4 w-4 mr-1" />
                        Change Role
                      </Button>
                    </ActionButtons>
                  </td>
                </tr>
              ))}
              {!users.length && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-muted-foreground">
                    {loading ? 'Loading users...' : 'No users match the filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <ModerationModal
        open={modalState.open}
        onClose={() => setModalState({ open: false })}
        onConfirm={performAction}
        destructive={modalState.action === 'ban'}
        title={actionLabel}
        description={modalState.user?.email}
        confirmText="Confirm"
      >
        {modalState.action === 'role' ? (
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">New role</Label>
            <select
              className="w-full bg-panel border border-border text-foreground rounded-md px-3 py-2"
              value={nextRole}
              onChange={(e) => setNextRole(e.target.value)}
            >
              {roleOptions
                .filter((r) => r !== 'ALL')
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>
          </div>
        ) : (
          <>
            {modalState.action === 'mute' || modalState.action === 'ban' ? (
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Duration (minutes)</Label>
                <Input
                  type="number"
                  min={5}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value, 10))}
                  className="bg-panel border-border text-foreground"
                />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Reason (optional)</Label>
              <Input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Reason for action"
                className="bg-panel border-border text-foreground"
              />
            </div>
          </>
        )}
      </ModerationModal>
    </div>
  );
}

