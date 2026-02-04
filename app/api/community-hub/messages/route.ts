import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { handleCommunityXP } from '@/lib/community-xp';

const ATTACHMENT_LIMIT_BYTES = 8 * 1024 * 1024; // 8MB per file
const ALLOWED_ATTACHMENT_PREFIXES = ['image/', 'application/pdf'];

const attachmentSchema = z.object({
  url: z.string().url(),
  name: z.string().max(120).optional().nullable(),
  type: z.string().max(120).optional().nullable(),
  size: z.number().max(ATTACHMENT_LIMIT_BYTES).optional().nullable(),
});

const messageSchema = z.object({
  channel_id: z.string().uuid(),
  content: z.string().trim().min(1, 'Message cannot be empty').max(4000, 'Message too long'),
  thread_parent_id: z.string().uuid().optional().nullable(),
  attachments: z.array(attachmentSchema).default([]),
});

async function getUserWithRole() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 } as const;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'role, is_admin, is_owner, banned, has_signals_access, has_mentorship_access, has_funding_access, has_ai_tools_access'
    )
    .eq('id', user.id)
    .single();

  return { user, role: profile?.role || 'MEMBER', profile, supabase } as const;
}

function canAccessChannel(
  user: {
    role?: string;
    is_admin?: boolean;
    is_owner?: boolean;
    banned?: boolean;
    has_signals_access?: boolean;
    has_mentorship_access?: boolean;
    has_funding_access?: boolean;
  },
  channelSlug?: string | null
) {
  if (user?.banned) return false;
  const isElevated = user?.role === 'ADMIN' || user?.role === 'MODERATOR' || user?.is_admin || user?.is_owner;
  if (isElevated) return true;

  const key = (channelSlug || '').toLowerCase();
  if (key === 'general') return true;
  if (key === 'signals' || key.includes('signal')) return !!user?.has_signals_access;
  if (key === 'mentorship' || key.includes('mentor')) return !!user?.has_mentorship_access;
  if (key === 'funding') return !!user?.has_funding_access;
  return true;
}

function attachmentIsAllowed(attachment: z.infer<typeof attachmentSchema>) {
  if (!attachment.type) return true;
  return ALLOWED_ATTACHMENT_PREFIXES.some((prefix) => attachment.type?.startsWith(prefix));
}

function logApiError(location: string, error: unknown, meta: Record<string, unknown> = {}) {
  console.error('[App Error]', { location, error, ...meta });
}

function normalizeAttachments(raw: z.infer<typeof attachmentSchema>[]) {
  return raw.map((att) => ({
    url: att.url,
    name: att.name || null,
    type: att.type || null,
    size: att.size || null,
  }));
}

// GET /api/community-hub/messages?channel_id=...&limit=...&before=...
export async function GET(request: NextRequest) {
  const ctx = await getUserWithRole();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channel_id');
  let limit = parseInt(searchParams.get('limit') || '120', 10);
  if (Number.isNaN(limit)) limit = 120;
  limit = Math.min(limit, 200);
  const before = searchParams.get('before');

  if (!channelId) {
    return NextResponse.json({ error: 'channel_id is required' }, { status: 400 });
  }

  const { supabase, role, profile } = ctx;
  const requester = { ...profile, role };
  if (requester?.banned) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }
  const { data: channel, error: channelError } = await supabase
    .from('community_channels')
    .select('id, slug, is_private, category')
    .eq('id', channelId)
    .single();

  if (channelError || !channel) {
    logApiError('community-hub/messages.GET.channel', channelError || 'Channel not found', { channelId });
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  const isAdmin = role === 'ADMIN' || role === 'MODERATOR' || requester?.is_admin || requester?.is_owner;
  if (channel.is_private && !isAdmin) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }

  const allowed = canAccessChannel(requester, channel.slug || channel.category);
  if (!allowed) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }

  let query = supabase
    .from('messages')
    .select(
      `
        id,
        content,
        created_at,
        updated_at,
        attachments,
        author_id,
        channel_id,
        is_pinned,
        thread_parent_id,
        profiles:profiles!messages_author_id_fkey (
          id,
          name,
          full_name,
          email,
          avatar_url,
          role
        ),
        reactions (
          emoji,
          user_id
        )
      `
    )
    .eq('channel_id', channelId)
    .is('deleted_at', null);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data: messages, error } = await query.order('created_at', { ascending: false }).limit(limit);

  if (error) {
    logApiError('community-hub/messages.GET.query', error, { channelId });
    return NextResponse.json({ error: 'Failed to load messages', details: error.message }, { status: 500 });
  }

  return NextResponse.json({
    messages: (messages || []).reverse(),
    hasMore: (messages || []).length >= limit,
    cursor: messages && messages.length ? messages[messages.length - 1].created_at : null,
    channel_id: channelId,
  });
}

// POST /api/community-hub/messages
export async function POST(request: NextRequest) {
  const ctx = await getUserWithRole();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { supabase, role, user, profile } = ctx;
  const requester = { ...profile, role };
  if (requester?.banned) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }
  const body = await request.json();
  const parsed = messageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { channel_id, attachments, content, thread_parent_id } = parsed.data;

  const { data: channel, error: channelError } = await supabase
    .from('community_channels')
    .select('id, slug, is_private, category')
    .eq('id', channel_id)
    .single();

  if (channelError || !channel) {
    logApiError('community-hub/messages.POST.channel', channelError || 'Channel not found', { channel_id });
    return NextResponse.json({ error: 'Channel not found' }, { status: 404 });
  }

  const isAdmin = role === 'ADMIN' || role === 'MODERATOR' || requester?.is_admin || requester?.is_owner;
  if (channel.slug === 'announcements' && !isAdmin) {
    return NextResponse.json({ error: 'Only admins can post in announcements' }, { status: 403 });
  }

  if (channel.is_private && !isAdmin) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }

  const allowed = canAccessChannel(requester, channel.slug || channel.category);
  if (!allowed) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }

  // Validate attachments
  const invalidAttachment = attachments.find(
    (att) =>
      (att.size ?? 0) > ATTACHMENT_LIMIT_BYTES ||
      (att.type && !attachmentIsAllowed(att))
  );

  if (invalidAttachment) {
    return NextResponse.json(
      { error: 'Attachment not allowed (type or size)', attachment: invalidAttachment },
      { status: 400 }
    );
  }

  const normalizedAttachments = normalizeAttachments(attachments);

  const isTradeChannel = channel.slug?.toLowerCase().includes('trade') || channel.slug?.toLowerCase().includes('setup')

  const { data: message, error } = await supabase
    .from('messages')
    .insert({
      channel_id,
      content: content.trim(),
      author_id: user.id,
      attachments: normalizedAttachments,
      thread_parent_id: thread_parent_id || null,
      is_trade_post: isTradeChannel,
    })
    .select(
      `
        id,
        content,
        created_at,
        updated_at,
        attachments,
        author_id,
        channel_id,
        is_pinned,
        thread_parent_id,
        profiles:profiles!messages_author_id_fkey (
          id,
          name,
          full_name,
          email,
          avatar_url,
          role
        )
      `
    )
    .single();

  if (error) {
    logApiError('community-hub/messages.POST.insert', error, { channel_id, user_id: user.id });
    return NextResponse.json({ error: 'Failed to send message', details: error.message }, { status: 500 });
  }

  try {
    await handleCommunityXP(supabase, user.id, 'message')
    if (isTradeChannel) {
      await handleCommunityXP(supabase, user.id, 'trade_post')
    }
    if (thread_parent_id) {
      await handleCommunityXP(supabase, user.id, 'reply', 1, true)
    }
    const mentionMatch = content.match(/@[\w.-]+/g)
    if (mentionMatch?.length) {
      await handleCommunityXP(supabase, user.id, 'mention', 1, true)
    }
  } catch (xpErr) {
    console.error('Community XP error:', xpErr)
  }

  return NextResponse.json({ message }, { status: 201 });
}

const moderationSchema = z.object({
  message_id: z.string().uuid(),
  action: z.enum(['pin', 'unpin', 'delete']),
});

// PATCH /api/community-hub/messages - moderation actions
export async function PATCH(request: NextRequest) {
  const ctx = await getUserWithRole();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { supabase, role } = ctx;
  const body = await request.json();
  const parsed = moderationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  if (role !== 'ADMIN' && role !== 'MODERATOR') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { message_id, action } = parsed.data;
  const now = new Date().toISOString();
  const updates =
    action === 'delete'
      ? { deleted_at: now, updated_at: now }
      : { is_pinned: action === 'pin', updated_at: now };

  const { data: message, error } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', message_id)
    .select(
      `
        id,
        content,
        created_at,
        updated_at,
        attachments,
        author_id,
        channel_id,
        is_pinned,
        thread_parent_id
      `
    )
    .single();

  if (error) {
    logApiError('community-hub/messages.PATCH.update', error, { message_id, action });
    return NextResponse.json({ error: 'Failed to update message', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ message });
}

