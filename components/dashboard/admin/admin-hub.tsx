'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  ShieldCheck,
  Users,
  LayoutDashboard,
  BarChart3,
  Settings2,
  Sparkles,
  Lock,
  Activity,
  MailCheck,
  CheckCircle2,
  AlertTriangle,
  ToggleRight,
  Search,
  EyeOff,
} from 'lucide-react';

type AdminRole = 'OWNER' | 'ADMIN' | undefined;

type AdminHubProps = {
  user: {
    email?: string;
    role?: string;
    adminRole?: AdminRole;
  };
};

type FeatureKey = 'signals' | 'auto_trader' | 'gold_to_glory';

type FeatureUser = {
  id: string;
  name: string;
  email: string;
  features: Record<FeatureKey, boolean>;
  lastUpdated: string;
};

type KillSwitchKey = 'signals' | 'auto_trader' | 'gold_to_glory' | 'community';

const systemStatuses = [
  { label: 'Auth & sessions', state: 'Healthy', icon: ShieldCheck, tone: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30' },
  { label: 'Realtime & events', state: 'Stable', icon: Activity, tone: 'text-amber-200 bg-amber-500/10 border-amber-400/30' },
  { label: 'Notifications', state: 'Queued', icon: MailCheck, tone: 'text-blue-200 bg-blue-500/10 border-blue-400/30' },
];

const summaryCards = [
  { label: 'Total members', value: '—', hint: 'Syncs from profiles', icon: Users },
  { label: 'Active services', value: 'Signals · Auto Trader · G2G', hint: 'Configured per access flags', icon: LayoutDashboard },
  { label: 'Pending reviews', value: '3', hint: 'Signals & community moderation', icon: CheckCircle2 },
  { label: 'Next checks', value: 'Weekly audit scheduled', hint: 'Role & access consistency', icon: Settings2 },
];

const mockAuditLogs = [
  { id: '1', ts: '2026-01-15T14:10:00Z', actor: 'alex@desk.ai', action: 'role.change', target: 'user:trader_42', scope: 'Membership' },
  { id: '2', ts: '2026-01-15T13:55:00Z', actor: 'alex@desk.ai', action: 'feature.toggle', target: 'signals → on', scope: 'Signals' },
  { id: '3', ts: '2026-01-15T13:20:00Z', actor: 'mara@desk.ai', action: 'content.publish', target: 'signal: NFP Playbook', scope: 'Signals' },
  { id: '4', ts: '2026-01-15T12:40:00Z', actor: 'alex@desk.ai', action: 'kill-switch', target: 'auto_trader → paused', scope: 'Automation' },
];

const mockFeatureUsers: FeatureUser[] = [
  { id: 'u1', name: 'Avery Chen', email: 'avery@example.com', features: { signals: true, auto_trader: false, gold_to_glory: true }, lastUpdated: '2h ago' },
  { id: 'u2', name: 'Jordan Patel', email: 'jordan@example.com', features: { signals: true, auto_trader: true, gold_to_glory: false }, lastUpdated: '4h ago' },
  { id: 'u3', name: 'Sam Rivera', email: 'sam@example.com', features: { signals: false, auto_trader: false, gold_to_glory: false }, lastUpdated: '1d ago' },
];

const killSwitchDefaults: Record<KillSwitchKey, boolean> = {
  signals: false,
  auto_trader: false,
  gold_to_glory: false,
  community: false,
};

const mockRoleUsers = [
  { id: 'u1', name: 'Avery Chen', email: 'avery@example.com', role: 'owner' },
  { id: 'u2', name: 'Jordan Patel', email: 'jordan@example.com', role: 'admin' },
  { id: 'u3', name: 'Sam Rivera', email: 'sam@example.com', role: 'member' },
];

export function AdminHub({ user }: AdminHubProps) {
  const adminName = user?.email?.split('@')[0] || 'Admin';
  const adminRole: AdminRole = (user?.adminRole as AdminRole) || 'OWNER';
  const isOwner = adminRole === 'OWNER';
  const isAdminOnly = adminRole === 'ADMIN';

  const [featureUsers, setFeatureUsers] = useState<FeatureUser[]>(mockFeatureUsers);
  const [killSwitches, setKillSwitches] = useState<Record<KillSwitchKey, boolean>>(killSwitchDefaults);
  const [search, setSearch] = useState('');

  const filteredFeatureUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return featureUsers;
    return featureUsers.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term));
  }, [featureUsers, search]);

  const toggleUserFeature = (userId: string, key: FeatureKey) => {
    if (!isOwner) return;
    setFeatureUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? {
              ...u,
              features: { ...u.features, [key]: !u.features[key] },
              lastUpdated: 'just now',
            }
          : u
      )
    );
  };

  const toggleKillSwitch = (key: KillSwitchKey) => {
    if (!isOwner) return;
    const next = !killSwitches[key];
    const confirmed = window.confirm(`Confirm ${next ? 'activate' : 'deactivate'} kill-switch for ${key.replace('_', ' ')}?`);
    if (!confirmed) return;
    setKillSwitches((prev) => ({ ...prev, [key]: next }));
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_50px_-35px_rgba(0,0,0,0.8)]">
        <div className="space-y-3 w-full">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Admin access granted
            </div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${isOwner ? 'border-gold-400/40 bg-gold-500/15 text-gold-100' : 'border-blue-400/30 bg-blue-500/10 text-blue-100'}`}>
              {isOwner ? 'Owner' : 'Admin'}
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-semibold text-white leading-tight">Admin Control Panel</h1>
            <p className="text-sm text-gray-300 mt-1">
              Centralised hub for platform operations, member oversight, and feature controls.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-300">
            <span className="rounded-full bg-white/10 border border-white/15 px-3 py-1">Signed in as {adminName}</span>
            <span className="rounded-full bg-amber-500/10 border border-amber-400/30 px-3 py-1 text-amber-100">UI-only safety: no backend writes</span>
          </div>
          <div className="flex flex-wrap gap-3 pt-1">
            <Link href="/admin/dashboard">
              <Button variant="secondary" className="bg-white/10 border border-white/20 text-white hover:bg-white/15">
                Open analytics
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button className="bg-gold-500 text-black hover:bg-gold-400">Return to member view</Button>
            </Link>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full lg:w-auto">
          {systemStatuses.map((status) => {
            const Icon = status.icon;
            return (
              <div key={status.label} className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${status.tone}`}>
                <Icon className="h-5 w-5" />
                <div className="leading-tight">
                  <p className="text-xs uppercase tracking-[0.14em] text-white/80">{status.label}</p>
                  <p className="text-sm font-semibold text-white">{status.state}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {summaryCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.label} className="bg-white/5 border border-white/10 hover:border-gold-400/40 transition-colors">
              <div className="flex items-start gap-3 p-5">
                <div className="rounded-lg bg-white/10 border border-white/15 p-2">
                  <Icon className="h-5 w-5 text-gold-200" />
                </div>
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-400">{item.label}</p>
                  <p className="text-base font-semibold text-white mt-1">{item.value}</p>
                  <p className="text-xs text-gray-400 mt-1">{item.hint}</p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">User Management</p>
              <h2 className="text-lg font-semibold text-white">Membership & Access</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-400/30 px-2 py-1 rounded-full">
                <CheckCircle2 className="h-4 w-4" /> Read-only
              </span>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { title: 'Directory', desc: 'Review member list, roles, and subscription hints.', action: '/admin/dashboard' },
              { title: 'Access flags', desc: 'Confirm unlocks for signals, auto trader, G2G.', action: '/dashboard' },
              { title: 'Support triage', desc: 'Escalate account fixes safely.', action: '/dashboard?section=notifications' },
            ].map((item) => (
              <div key={item.title} className="flex items-start justify-between rounded-xl border border-white/10 bg-white/5 p-4">
                <div>
                  <p className="font-semibold text-white">{item.title}</p>
                  <p className="text-sm text-gray-400">{item.desc}</p>
                </div>
                <Link href={item.action}>
                  <Button variant="outline" size="sm" className="border-white/20 text-white hover:bg-white/10">
                    Open
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>

        <Card className="bg-white/5 border border-white/10 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Content & Features</p>
              <h2 className="text-lg font-semibold text-white">Publishing Controls</h2>
            </div>
            <Sparkles className="h-5 w-5 text-gold-200" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { title: 'Signals', desc: 'Publish, schedule, and monitor engagement.', href: '/dashboard?section=signals' },
              { title: 'Auto Trader', desc: 'Toggle availability and rollout steps.', href: '/dashboard?section=auto-trader' },
              { title: 'G2G challenge', desc: 'Update milestones and check-ins.', href: '/dashboard?section=gold-to-glory' },
              { title: 'Community', desc: 'Moderate threads and highlights.', href: '/dashboard?section=community-hub' },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white">{item.title}</p>
                <p className="text-sm text-gray-400 mb-3">{item.desc}</p>
                <Link href={item.href}>
                  <Button size="sm" className="bg-gold-500 text-black hover:bg-gold-400">
                    Manage
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <Card className="bg-white/5 border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Feature Access</p>
              <h2 className="text-lg font-semibold text-white">Per-user toggles</h2>
              <p className="text-sm text-gray-400">Owner managed. Admins have read-only visibility for toggles.</p>
            </div>
            <ToggleRight className="h-5 w-5 text-gold-200" />
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2">
            <Search className="h-4 w-4 text-gray-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user or email"
              className="w-full bg-transparent text-sm text-white placeholder:text-gray-500 focus:outline-none"
            />
          </div>
          <div className="space-y-3">
            {filteredFeatureUsers.map((u) => (
              <div key={u.id} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold text-white">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <span className="text-[11px] text-gray-400">Updated {u.lastUpdated}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['signals', 'auto_trader', 'gold_to_glory'] as FeatureKey[]).map((key) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => toggleUserFeature(u.id, key)}
                      disabled={!isOwner}
                      className={`flex items-center justify-between rounded-lg border px-3 py-2 text-sm transition ${
                        u.features[key]
                          ? 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                          : 'border-white/10 bg-white/5 text-gray-200'
                      } ${!isOwner ? 'opacity-70 cursor-not-allowed' : 'hover:border-gold-400/40 hover:bg-white/10'}`}
                    >
                      <span className="capitalize">{key.replace('_', ' ')}</span>
                      <span className="text-[11px] font-semibold">{u.features[key] ? 'On' : 'Off'}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            {filteredFeatureUsers.length === 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <EyeOff className="h-4 w-4" />
                No users found for that search.
              </div>
            )}
          </div>
        </Card>

        <Card className="bg-white/5 border border-white/10 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Emergency Controls</p>
              <h2 className="text-lg font-semibold text-white">Kill-switches</h2>
              <p className="text-sm text-gray-400">Owner only. Confirmation required. UI-level only.</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-amber-300" />
          </div>
          {!isOwner && (
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-gray-300">
              Admins can view status but cannot toggle platform-wide controls.
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(Object.keys(killSwitches) as KillSwitchKey[]).map((key) => (
              <div key={key} className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-white capitalize">{key.replace('_', ' ')}</p>
                  <span
                    className={`text-[11px] px-2 py-1 rounded-full border ${
                      killSwitches[key]
                        ? 'border-amber-400/40 bg-amber-500/10 text-amber-100'
                        : 'border-emerald-400/40 bg-emerald-500/10 text-emerald-100'
                    }`}
                  >
                    {killSwitches[key] ? 'Paused' : 'Active'}
                  </span>
                </div>
                <p className="text-xs text-gray-400">
                  {killSwitches[key]
                    ? 'Feature is paused platform-wide until re-enabled.'
                    : 'Live for eligible members.'}
                </p>
                <Button
                  onClick={() => toggleKillSwitch(key)}
                  disabled={!isOwner}
                  variant={killSwitches[key] ? 'secondary' : 'destructive'}
                  className={`w-full ${!isOwner ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {killSwitches[key] ? 'Resume' : 'Pause'} {key.replace('_', ' ')}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card className="bg-white/5 border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
              <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Audit Logs</p>
            <h2 className="text-lg font-semibold text-white">Admin actions</h2>
            <p className="text-sm text-gray-400">Immutable, newest first. Owner-only visibility.</p>
          </div>
          <BarChart3 className="h-5 w-5 text-gold-200" />
        </div>
        {isOwner ? (
          <div className="space-y-2">
            {mockAuditLogs.map((log) => (
              <div key={log.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-white">{log.action}</p>
                  <p className="text-xs text-gray-400">Scope: {log.scope} • Target: {log.target}</p>
                </div>
                <div className="text-right space-y-1">
                  <span className="block text-xs text-gray-400">{new Date(log.ts).toLocaleString()}</span>
                  <span className="inline-flex items-center gap-2 text-xs text-emerald-200 bg-emerald-500/10 border border-emerald-400/30 px-2 py-1 rounded-full">
                    <ShieldCheck className="h-3 w-3" />
                    {log.actor}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300 flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-400" />
            Audit log visibility is restricted to Owners.
          </div>
        )}
      </Card>

      <Card className="bg-white/5 border border-white/10 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-gray-400">Role Management</p>
            <h2 className="text-lg font-semibold text-white">Owners only</h2>
            <p className="text-sm text-gray-400">Change roles between member/admin. Owners cannot be demoted accidentally.</p>
          </div>
          <ShieldCheck className="h-5 w-5 text-gold-200" />
        </div>
        {!isOwner && (
          <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-gray-300 flex items-center gap-2">
            <Lock className="h-4 w-4 text-gray-400" />
            Role changes are restricted to Owners.
          </div>
        )}
        {isOwner && (
          <div className="space-y-3">
            {mockRoleUsers.map((u) => (
              <div key={u.id} className="rounded-xl border border-white/10 bg-white/5 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{u.name}</p>
                  <p className="text-xs text-gray-400">{u.email}</p>
                  <p className="text-xs text-gray-500 mt-1">Current role: {u.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    defaultValue={u.role}
                    className="bg-white/10 border border-white/20 text-sm text-white rounded-lg px-3 py-2 focus:outline-none"
                    onChange={(e) => {
                      const next = e.target.value;
                      if (u.role === 'owner' && next !== 'owner') {
                        const confirmed = window.confirm('This user is an owner. Confirm demoting to admin/member?');
                        if (!confirmed) {
                          e.target.value = u.role;
                          return;
                        }
                      }
                      const ok = window.confirm(`Change ${u.name}'s role to ${next}?`);
                      if (!ok) {
                        e.target.value = u.role;
                      }
                    }}
                  >
                    <option value="member">Member</option>
                    <option value="admin">Admin</option>
                    <option value="owner" disabled>
                      Owner (protected)
                    </option>
                  </select>
                  <Button size="sm" className="bg-gold-500 text-black hover:bg-gold-400">
                    Save (UI-only)
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
