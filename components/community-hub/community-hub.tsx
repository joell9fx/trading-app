'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createSupabaseClient } from '@/lib/supabase/client';
import { ChannelList } from './channel-list';
import { ChatWindow } from './chat-window';
import { MessageInput } from './message-input';
import { HubAttachment, HubChannel, HubMessage, HubUser } from './types';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Loader2, Settings } from 'lucide-react';

interface CommunityHubProps {
  user: HubUser;
}

const FALLBACK_CHANNELS: HubChannel[] = [
  { id: 'fallback-general', name: '🟢 General Chat', slug: 'general-chat', category: 'general', description: 'Welcome everyone!' },
  { id: 'fallback-forex', name: '💬 Forex Discussion', slug: 'forex-discussion', category: 'forex', description: 'FX and macro talk.' },
  { id: 'fallback-crypto', name: '💰 Crypto Discussion', slug: 'crypto-discussion', category: 'crypto', description: 'Digital assets chat.' },
  { id: 'fallback-signals', name: '📈 Signal Talk', slug: 'signal-talk', category: 'signals', description: 'Discuss shared signals.' },
  { id: 'fallback-mentorship', name: '🎓 Mentorship Room', slug: 'mentorship-room', category: 'mentorship', description: 'Guided practice.' },
  { id: 'fallback-announcements', name: '📢 Announcements', slug: 'announcements', category: 'announcements', description: 'Admin-only updates.', is_private: false },
];

function formatChannelTitle(channel?: HubChannel | null) {
  if (!channel) return 'Community Hub';
  return channel.name;
}

const isValidUUID = (value?: string | null) => {
  if (!value) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
};

const logError = (location: string, error: unknown) => {
  console.error('[App Error]', { location, error });
};

export function CommunityHub({ user }: CommunityHubProps) {
  const supabase = useMemo(() => createSupabaseClient(), []);
  const { toast } = useToast();

  const [channels, setChannels] = useState<HubChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState<HubChannel | null>(null);
  const [messages, setMessages] = useState<HubMessage[]>([]);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [messageText, setMessageText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [loadingOlder, setLoadingOlder] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [showCreateChannel, setShowCreateChannel] = useState(false);
  const [newChannelName, setNewChannelName] = useState('');
  const [newChannelDescription, setNewChannelDescription] = useState('');
  const [newChannelCategory, setNewChannelCategory] = useState<HubChannel['category']>('general');
  const [creatingChannel, setCreatingChannel] = useState(false);
  const profileCache = useRef<Map<string, any>>(new Map());
  const realtimeChannelRef = useRef<any>(null);

  const isModerator = user.role === 'ADMIN' || user.role === 'MODERATOR';
  const isRealChannel = activeChannel ? isValidUUID(activeChannel.id) : false;

  // Load channels on mount
  useEffect(() => {
    fetchChannels();
  }, []);

  // Load messages when channel changes
  useEffect(() => {
    if (!activeChannel) return;
    setLoadError(null);
    setMessages([]);
    setHasMore(true);
    if (isValidUUID(activeChannel.id)) {
      fetchMessages(activeChannel.id);
      setupRealtime(activeChannel.id);
    } else {
      setLoadError('Invalid channel. Please select another.');
    }
    return () => {
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeChannel?.id]);

  const activeChannelId = activeChannel?.id;

  const fetchChannels = async () => {
    try {
      setLoadingChannels(true);
      const res = await fetch('/api/community-hub/channels');
      if (!res.ok) {
        setChannels(FALLBACK_CHANNELS);
        setActiveChannel((current) => current || FALLBACK_CHANNELS[0]);
        return;
      }
      const data = await res.json();
      const channelData = (data.channels as HubChannel[]) || [];
      setChannels(channelData);
      const defaultChannel =
        channelData.find((c) => c.slug === 'general-chat') ||
        channelData.find((c) => c.slug === 'announcements') ||
        channelData[0];
      if (defaultChannel) {
        setActiveChannel((current) => current || defaultChannel);
      }
    } catch (error) {
      logError('CommunityHub.fetchChannels', error);
      setChannels(FALLBACK_CHANNELS);
      setActiveChannel((current) => current || FALLBACK_CHANNELS[0]);
    } finally {
      setLoadingChannels(false);
    }
  };

  const hydrateProfile = async (userId: string) => {
    if (profileCache.current.has(userId)) return profileCache.current.get(userId);
    const { data } = await supabase
      .from('profiles')
      .select('id, name, full_name, email, avatar_url, role')
      .eq('id', userId)
      .single();
    if (data) {
      profileCache.current.set(userId, data);
    }
    return data;
  };

  const hydrateMessage = async (message: HubMessage) => {
    if (!message.profiles) {
      const profile = await hydrateProfile(message.author_id);
      message = { ...message, profiles: profile || undefined };
    }
    if (!message.reactions) {
      const { data: reactions } = await supabase
        .from('reactions')
        .select('emoji, user_id')
        .eq('message_id', message.id);
      message = { ...message, reactions: reactions || [] };
    }
    return message;
  };

  const fetchMessages = async (channelId: string, opts?: { before?: string; append?: boolean }) => {
    if (!isValidUUID(channelId)) {
      setLoadError('Invalid channel. Please select another.');
      setMessages([]);
      setHasMore(false);
      setLoadingMessages(false);
      setLoadingOlder(false);
      return;
    }
    try {
      if (opts?.append) {
        setLoadingOlder(true);
      } else {
        setLoadingMessages(true);
      }
      const params = new URLSearchParams({ channel_id: channelId, limit: '50' });
      if (opts?.before) params.set('before', opts.before);
      const res = await fetch(`/api/community-hub/messages?${params.toString()}`);
      const payload = await res.json().catch(() => null);
      if (!res.ok) {
        logError('CommunityHub.fetchMessages.response', { status: res.status, body: payload, channelId });
        toast({ title: 'Error', description: 'Failed to load messages', variant: 'destructive' });
        setLoadError('Failed to load messages. Please try again.');
        setHasMore(false);
        return;
      }
      const incoming: HubMessage[] = (payload?.messages as HubMessage[]) || [];
      setHasMore(Boolean(payload?.hasMore));
      setLoadError(null);

      setMessages((prev) => {
        if (opts?.append) {
          const merged = [...incoming, ...prev];
          const dedup = new Map<string, HubMessage>();
          merged.forEach((m) => dedup.set(m.id, m));
          return Array.from(dedup.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        }
        return (incoming || []).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
      });
    } catch (error) {
      logError('CommunityHub.fetchMessages', error);
      toast({ title: 'Error', description: 'Unable to load messages', variant: 'destructive' });
      setLoadError('Failed to load messages. Please try again.');
      setHasMore(false);
    } finally {
      setLoadingMessages(false);
      setLoadingOlder(false);
    }
  };

  const setupRealtime = (channelId: string) => {
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
    }
    const channel = supabase
      .channel(`community-hub-${channelId}`, {
        config: { broadcast: { self: true } },
      })
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const incoming = payload.new as HubMessage;
          const hydrated = await hydrateMessage(incoming);
          setMessages((prev) => {
            if (prev.find((m) => m.id === hydrated.id)) return prev;
            return [...prev, hydrated].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        async (payload) => {
          const updated = payload.new as HubMessage;
          const hydrated = await hydrateMessage(updated);
          setMessages((prev) =>
            prev.map((m) => (m.id === hydrated.id ? { ...m, ...hydrated } : m)).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
          );
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'messages', filter: `channel_id=eq.${channelId}` },
        (payload) => {
          const deletedId = (payload.old as any)?.id;
          if (deletedId) {
            setMessages((prev) => prev.filter((m) => m.id !== deletedId));
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  };

  const uploadAttachments = async (): Promise<HubAttachment[]> => {
    if (!pendingFiles.length) return [];
    const uploads: HubAttachment[] = [];
    for (const file of pendingFiles) {
      if (file.size > 8 * 1024 * 1024) {
        throw new Error(`${file.name} is larger than 8MB.`);
      }
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error, data } = await supabase.storage.from('community-uploads').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (error) {
        throw error;
      }
      const { data: publicUrl } = supabase.storage.from('community-uploads').getPublicUrl(data.path);
      uploads.push({
        url: publicUrl.publicUrl,
        name: file.name,
        type: file.type,
        size: file.size,
      });
    }
    return uploads;
  };

  const handleSend = async () => {
    if (!messageText.trim() || !activeChannel) return;
    if (!isValidUUID(activeChannel.id)) {
      toast({
        title: 'Channel unavailable',
        description: 'Please select a valid channel before sending.',
        variant: 'destructive',
      });
      return;
    }
    const tempId = `temp-${Date.now()}`;
    const optimistic: HubMessage = {
      id: tempId,
      content: messageText,
      created_at: new Date().toISOString(),
      author_id: user.id,
      channel_id: activeChannel.id,
      attachments: [],
      profiles: {
        id: user.id,
        name: user.name || user.full_name || user.email,
        full_name: user.full_name,
        email: user.email,
        avatar_url: user.avatar_url,
        role: user.role,
      },
      reactions: [],
    };

    setMessages((prev) => [...prev, optimistic]);
    setMessageText('');
    setIsSending(true);
    try {
      const attachments = await uploadAttachments();
      const res = await fetch('/api/community-hub/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel_id: activeChannel.id,
          content: messageText,
          attachments,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        logError('CommunityHub.handleSend.response', { status: res.status, body: data });
        throw new Error(data?.error || 'Failed to send message');
      }
      setPendingFiles([]);
      if (data.message) {
        setMessages((prev) =>
          prev
            .map((m) => (m.id === tempId ? data.message : m))
            .filter((m, idx, arr) => arr.findIndex((x) => x.id === m.id) === idx)
            .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        );
      }
    } catch (error: any) {
      logError('CommunityHub.handleSend', error);
      toast({ title: 'Send failed', description: error?.message || 'Unable to send message', variant: 'destructive' });
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setIsSending(false);
    }
  };

  const handleReact = async (messageId: string, emoji: string) => {
    try {
      const res = await fetch('/api/community-hub/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, emoji }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        logError('CommunityHub.handleReact.response', { status: res.status, body: data });
        throw new Error(data?.error || 'Reaction failed');
      }

      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          const existing = m.reactions || [];
          if (data.state === 'removed') {
            return { ...m, reactions: existing.filter((r) => !(r.user_id === user.id && r.emoji === emoji)) };
          }
          return { ...m, reactions: [...existing, { emoji, user_id: user.id }] };
        })
      );
    } catch (error: any) {
      logError('CommunityHub.handleReact', error);
      toast({ title: 'Reaction error', description: error?.message || 'Could not react', variant: 'destructive' });
    }
  };

  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCreateChannel = async () => {
    if (!newChannelName.trim()) {
      toast({ title: 'Name required', description: 'Please enter a channel name.' });
      return;
    }
    setCreatingChannel(true);
    try {
      const res = await fetch('/api/community-hub/channels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newChannelName.trim(),
          description: newChannelDescription.trim(),
          category: newChannelCategory,
          is_private: false,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        logError('CommunityHub.handleCreateChannel.response', { status: res.status, body: data });
        throw new Error(data?.error || 'Failed to create channel');
      }
      const channel = data.channel as HubChannel;
      setChannels((prev) => [...prev, channel]);
      setActiveChannel(channel);
      setShowCreateChannel(false);
      setNewChannelName('');
      setNewChannelDescription('');
    } catch (error: any) {
      logError('CommunityHub.handleCreateChannel', error);
      toast({ title: 'Create channel failed', description: error?.message || 'Could not create channel', variant: 'destructive' });
    } finally {
      setCreatingChannel(false);
    }
  };

  const handlePin = async (messageId: string, pinned: boolean) => {
    try {
      const res = await fetch('/api/community-hub/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, action: pinned ? 'pin' : 'unpin' }),
      });
      if (!res.ok) throw new Error('Unable to update pin');
      setMessages((prev) => prev.map((m) => (m.id === messageId ? { ...m, is_pinned: pinned } : m)));
    } catch (error: any) {
      logError('CommunityHub.handlePin', error);
      toast({ title: 'Pin failed', description: error?.message || 'Could not pin message', variant: 'destructive' });
    }
  };

  const handleDelete = async (messageId: string) => {
    try {
      const res = await fetch('/api/community-hub/messages', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message_id: messageId, action: 'delete' }),
      });
      if (!res.ok) throw new Error('Unable to delete message');
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } catch (error: any) {
      logError('CommunityHub.handleDelete', error);
      toast({ title: 'Delete failed', description: error?.message || 'Could not delete message', variant: 'destructive' });
    }
  };

  const handleFileSelection = (files: FileList) => {
    const next = Array.from(files);
    const tooLarge = next.find((f) => f.size > 8 * 1024 * 1024);
    if (tooLarge) {
      toast({ title: 'File too large', description: `${tooLarge.name} exceeds 8MB`, variant: 'destructive' });
      return;
    }
    setPendingFiles((prev) => [...prev, ...next]);
  };

  const canPost = useMemo(() => {
    if (!activeChannel) return false;
    if (!isValidUUID(activeChannel.id)) return false;
    if (activeChannel.slug === 'announcements' && !isModerator) return false;
    return true;
  }, [activeChannel, isModerator]);

  const pendingFileChips = pendingFiles.map((file, index) => (
    <Badge key={file.name + file.size} variant="outline" className="bg-gray-900 text-gray-200 border-gray-800 gap-2">
      <span>{file.name}</span>
      <button
        type="button"
        className="text-gray-500 hover:text-white"
        onClick={() => removePendingFile(index)}
      >
        ×
      </button>
    </Badge>
  ));

  const topBar = (
    <div className="flex items-center justify-between mb-4">
      <div>
        <p className="text-xs uppercase tracking-wide text-gray-500">Community Hub</p>
        <h1 className="text-2xl font-bold text-white">{formatChannelTitle(activeChannel)}</h1>
        {activeChannel?.description ? <p className="text-gray-500 text-sm">{activeChannel.description}</p> : null}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-amber-200">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-amber-200">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      {showCreateChannel && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md bg-gray-950 border border-gray-800 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-gray-500">Admin</p>
                <h3 className="text-lg font-semibold text-white">Create Channel</h3>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowCreateChannel(false)} className="text-gray-400 hover:text-white">
                Close
              </Button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-400">Name</label>
                <Input
                  value={newChannelName}
                  onChange={(e) => setNewChannelName(e.target.value)}
                  placeholder="e.g. Orderflow-lab"
                  className="bg-gray-900 border-gray-800 text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Description</label>
                <Textarea
                  value={newChannelDescription}
                  onChange={(e) => setNewChannelDescription(e.target.value)}
                  rows={2}
                  placeholder="What is this channel about?"
                  className="bg-gray-900 border-gray-800 text-gray-100"
                />
              </div>
              <div>
                <label className="text-xs text-gray-400">Category</label>
                <select
                  value={newChannelCategory}
                  onChange={(e) => setNewChannelCategory(e.target.value as HubChannel['category'])}
                  className="w-full bg-gray-900 border border-gray-800 text-gray-100 rounded-lg px-3 py-2"
                >
                  <option value="general">General</option>
                  <option value="forex">Forex</option>
                  <option value="crypto">Crypto</option>
                  <option value="signals">Signals</option>
                  <option value="mentorship">Mentorship</option>
                  <option value="announcements">Announcements</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" onClick={() => setShowCreateChannel(false)} className="text-gray-400">
                Cancel
              </Button>
              <Button
                onClick={handleCreateChannel}
                disabled={creatingChannel}
                className="bg-gradient-to-r from-amber-400 to-yellow-500 text-black hover:from-amber-300 hover:to-yellow-400"
              >
                {creatingChannel ? 'Creating...' : 'Create'}
              </Button>
            </div>
          </Card>
        </div>
      )}
      {topBar}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-4">
        <div className="xl:col-span-1 h-[780px]">
          <ChannelList
            channels={channels}
            activeChannelId={activeChannelId || undefined}
            onSelect={(channel) => setActiveChannel(channel)}
            onCreate={() => setShowCreateChannel(true)}
            canManage={isModerator}
          />
        </div>

        <div className="xl:col-span-4 h-[780px] flex flex-col gap-3">
          <Card className="bg-gray-950/60 border border-gray-800 rounded-2xl shadow-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Active Channel</p>
                <p className="text-lg font-semibold text-white">{activeChannel?.name || 'Select a channel'}</p>
              </div>
              {!canPost && (
                <Badge variant="secondary" className="bg-gray-900 text-amber-200 border-amber-300/50">
                  Read only
                </Badge>
              )}
            </div>
          </Card>

          {loadError && (
            <div className="p-3 rounded-lg border border-red-700/50 bg-red-900/30 text-red-200 text-sm">
              ⚠️ {loadError}
            </div>
          )}

          <div className="flex-1 min-h-0">
            <ChatWindow
              messages={messages}
              currentUser={user}
              onReact={handleReact}
              onPin={handlePin}
              onDelete={handleDelete}
              isLoading={loadingMessages}
              onLoadOlder={() => {
                if (!messages.length || loadingOlder || !hasMore || !isRealChannel || !activeChannel) return;
                fetchMessages(activeChannel.id, { before: messages[0].created_at, append: true });
              }}
              loadingOlder={loadingOlder}
              hasMore={hasMore}
            />
          </div>

          <div className="space-y-2">
            {pendingFileChips.length ? <div className="flex flex-wrap gap-2">{pendingFileChips}</div> : null}
            <MessageInput
              value={messageText}
              onChange={setMessageText}
              onSend={handleSend}
              onUpload={handleFileSelection}
              disabled={!canPost || isSending || loadingChannels}
              isSending={isSending}
            />
            {!canPost && (
              <p className="text-xs text-gray-500">
                This channel is read-only for members. Admins can post announcements.
              </p>
            )}
          </div>
        </div>
      </div>

      {loadingChannels && (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading channels...
        </div>
      )}
    </div>
  );
}

export default CommunityHub;

