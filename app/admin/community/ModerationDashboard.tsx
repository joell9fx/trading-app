'use client';

import { useEffect, useState } from 'react';
import { ShieldCheck, Users, MessageSquare, RadioTower, FileWarning, Activity } from 'lucide-react';
import Overview from './Overview';
import UsersPanel from './UsersPanel';
import MessagesPanel from './MessagesPanel';
import ChannelsPanel from './ChannelsPanel';
import ReportsPanel from './ReportsPanel';
import { Button } from '@/components/ui/button';

export type AdminInfo = {
  id: string;
  name?: string | null;
  email?: string | null;
};

export type HubChannelLite = {
  id: string;
  name: string;
  slug: string;
  category?: string | null;
  is_private?: boolean | null;
  archived_at?: string | null;
};

const tabs = [
  { key: 'overview', label: 'Overview', icon: Activity },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'messages', label: 'Messages', icon: MessageSquare },
  { key: 'channels', label: 'Channels', icon: RadioTower },
  { key: 'reports', label: 'Reports', icon: FileWarning },
];

export default function ModerationDashboard({ admin }: { admin: AdminInfo }) {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [channels, setChannels] = useState<HubChannelLite[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(false);

  const loadChannels = async () => {
    setLoadingChannels(true);
    try {
      const res = await fetch('/api/admin/community/channels');
      const data = await res.json();
      if (res.ok) {
        setChannels(data.channels || []);
      }
    } finally {
      setLoadingChannels(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm px-4 py-3 flex flex-wrap gap-2">
        <div className="flex items-center gap-2 text-gray-700 font-semibold">
          <ShieldCheck className="h-5 w-5 text-blue-600" />
          <span>Admin Controls</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <Button
                key={tab.key}
                variant={active ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab(tab.key)}
                className={active ? 'bg-blue-600 text-white hover:bg-blue-500' : 'border-gray-300'}
              >
                <Icon className="h-4 w-4 mr-2" />
                {tab.label}
              </Button>
            );
          })}
        </div>
      </div>

      {activeTab === 'overview' && <Overview adminId={admin.id} channels={channels} />}
      {activeTab === 'users' && <UsersPanel adminId={admin.id} />}
      {activeTab === 'messages' && <MessagesPanel adminId={admin.id} channels={channels} />}
      {activeTab === 'channels' && (
        <ChannelsPanel adminId={admin.id} channels={channels} onRefresh={loadChannels} loading={loadingChannels} />
      )}
      {activeTab === 'reports' && <ReportsPanel adminId={admin.id} channels={channels} />}
    </div>
  );
}

