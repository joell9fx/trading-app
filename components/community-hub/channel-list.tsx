import { Hash, PlusCircle, ShieldAlert, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { HubChannel } from './types';
import { useMemo, useState } from 'react';

interface ChannelListProps {
  channels: HubChannel[];
  activeChannelId?: string;
  onSelect: (channel: HubChannel) => void;
  onCreate?: () => void;
  canManage?: boolean;
}

const CATEGORY_META: Record<HubChannel['category'], { label: string; emoji: string }> = {
  general: { label: 'General', emoji: '🟢' },
  forex: { label: 'Forex', emoji: '💬' },
  crypto: { label: 'Crypto', emoji: '💰' },
  signals: { label: 'Signals', emoji: '📈' },
  mentorship: { label: 'Mentorship', emoji: '🎓' },
  announcements: { label: 'Announcements', emoji: '📢' },
};

export function ChannelList({ channels, activeChannelId, onSelect, onCreate, canManage }: ChannelListProps) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const term = search.toLowerCase().trim();
    if (!term) return channels;
    return channels.filter((c) => c.name.toLowerCase().includes(term) || c.slug.toLowerCase().includes(term));
  }, [channels, search]);

  const grouped = useMemo(() => {
    return filtered.reduce<Record<string, HubChannel[]>>((acc, channel) => {
      const key = channel.category || 'general';
      acc[key] = acc[key] || [];
      acc[key].push(channel);
      return acc;
    }, {});
  }, [filtered]);

  return (
    <div className="h-full flex flex-col bg-gray-950/60 border border-gray-800 rounded-2xl shadow-xl backdrop-blur">
      <div className="p-4 border-b border-gray-800 flex items-center gap-2">
        <div className="flex-1">
          <p className="text-xs uppercase tracking-wide text-gray-500">Community Hub</p>
          <h3 className="text-lg font-semibold text-white">Channels</h3>
        </div>
        {canManage && (
          <Button size="sm" variant="secondary" onClick={onCreate} className="bg-gold-500 text-black hover:bg-gold-600">
            <PlusCircle className="h-4 w-4 mr-1" />
            New
          </Button>
        )}
      </div>

      <div className="px-4 py-3">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search channels..."
          className="bg-gray-900 border-gray-800 text-gray-100 placeholder:text-gray-500"
        />
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-4">
        {Object.entries(CATEGORY_META).map(([key, meta]) => {
          const list = grouped[key] || [];
          if (!list.length && key !== 'announcements') return null;
          return (
            <div key={key}>
              <div className="flex items-center gap-2 px-2 mb-2 text-xs uppercase tracking-wide text-gray-500">
                <span>{meta.emoji}</span>
                <span>{meta.label}</span>
              </div>
              <div className="space-y-1">
                {list.length ? (
                  list.map((channel) => {
                    const active = activeChannelId === channel.id;
                    return (
                      <button
                        key={channel.id}
                        onClick={() => onSelect(channel)}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left transition-all ${
                          active
                            ? 'bg-gradient-to-r from-gold-500 via-amber-400 to-yellow-500 text-black shadow-lg'
                            : 'hover:bg-gray-900 text-gray-200'
                        }`}
                      >
                        <Hash className={`h-4 w-4 ${active ? 'text-black' : 'text-gray-500'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold truncate ${active ? 'text-black' : 'text-gray-100'}`}>
                            {channel.name}
                          </p>
                          {channel.description && !active && (
                            <p className="text-xs text-gray-500 truncate">{channel.description}</p>
                          )}
                        </div>
                        {channel.is_private ? (
                          <Lock className={`h-4 w-4 ${active ? 'text-black' : 'text-gray-500'}`} />
                        ) : null}
                        {channel.slug === 'announcements' ? (
                          <ShieldAlert className={`h-4 w-4 ${active ? 'text-black' : 'text-gray-500'}`} />
                        ) : null}
                        {channel.unread_count ? (
                          <span className="min-w-[24px] px-2 py-0.5 rounded-full bg-black/40 text-xs font-bold text-amber-200 text-center">
                            {channel.unread_count}
                          </span>
                        ) : null}
                      </button>
                    );
                  })
                ) : (
                  <div className="px-3 py-3 rounded-lg border border-dashed border-gray-800 text-sm text-gray-500">
                    No channels in {meta.label}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div>
          <div className="flex items-center gap-2 px-2 mb-2 text-xs uppercase tracking-wide text-gray-500">
            <User className="h-4 w-4" />
            <span>Direct Messages</span>
          </div>
          <div className="px-3 py-3 rounded-lg border border-dashed border-gray-800 text-sm text-gray-500 bg-gray-950/40">
            Coming soon — start private conversations with mentors and peers.
          </div>
        </div>
      </div>
    </div>
  );
}

