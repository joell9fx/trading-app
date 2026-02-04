import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const reactionSchema = z.object({
  message_id: z.string().uuid(),
  emoji: z.string().min(1).max(16),
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
    .select('role')
    .eq('id', user.id)
    .single();

  return { user, role: profile?.role || 'MEMBER', supabase } as const;
}

// POST /api/community-hub/reactions toggles a reaction for the current user
export async function POST(request: NextRequest) {
  const ctx = await getUserWithRole();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { supabase, role, user } = ctx;
  const body = await request.json();
  const parsed = reactionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { message_id, emoji } = parsed.data;

  const { data: message } = await supabase
    .from('messages')
    .select('id, channel_id')
    .eq('id', message_id)
    .single();

  if (!message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  const { data: channel } = await supabase
    .from('community_channels')
    .select('slug, is_private')
    .eq('id', message.channel_id)
    .single();

  const isAdmin = role === 'ADMIN' || role === 'MODERATOR';
  if (channel?.slug === 'announcements' && !isAdmin) {
    return NextResponse.json({ error: 'Announcements are read-only for members' }, { status: 403 });
  }

  if (channel?.is_private && !isAdmin) {
    return NextResponse.json({ error: 'Channel is private' }, { status: 403 });
  }

  const { data: existing } = await supabase
    .from('reactions')
    .select('id')
    .eq('message_id', message_id)
    .eq('user_id', user.id)
    .eq('emoji', emoji)
    .maybeSingle();

  if (existing) {
    await supabase.from('reactions').delete().eq('id', existing.id);
    return NextResponse.json({ state: 'removed', emoji, message_id });
  }

  const { error: insertError } = await supabase.from('reactions').insert({
    message_id,
    user_id: user.id,
    emoji,
  });

  if (insertError) {
    return NextResponse.json({ error: 'Failed to add reaction', details: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ state: 'added', emoji, message_id });
}

