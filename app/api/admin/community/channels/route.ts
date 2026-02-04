import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../utils';

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export async function GET() {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const { data: channels, error: channelError } = await supabase
    .from('community_channels')
    .select('id, name, description, slug, category, is_private, created_at, updated_at, archived_at');

  if (channelError) {
    return NextResponse.json({ error: 'Failed to load channels', details: channelError.message }, { status: 500 });
  }

  // Compute member counts per channel (messages authors)
  const counts = await Promise.all(
    (channels || []).map(async (channel) => {
      const { count } = await supabase
        .from('messages')
        .select('author_id', { count: 'exact', head: true })
        .eq('channel_id', channel.id)
        .is('deleted_at', null);
      return { channel_id: channel.id, memberCount: count || 0 };
    })
  );

  const countsMap = new Map(counts.map((c) => [c.channel_id, c.memberCount]));

  const enriched = (channels || []).map((c) => ({
    ...c,
    member_count: countsMap.get(c.id) || 0,
  }));

  return NextResponse.json({ channels: enriched });
}

export async function POST(request: NextRequest) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const body = await request.json();
  const { name, description, category = 'general', is_private = false } = body;

  if (!name || typeof name !== 'string' || name.length < 2) {
    return NextResponse.json({ error: 'Channel name is required' }, { status: 400 });
  }

  const slug = slugify(name);
  const insertPayload = {
    name: name.trim(),
    description: description || null,
    category,
    is_private,
    slug,
  };

  const { data: channel, error: insertError } = await supabase
    .from('community_channels')
    .upsert(insertPayload, { onConflict: 'slug' })
    .select()
    .single();

  if (insertError) {
    return NextResponse.json({ error: 'Failed to save channel', details: insertError.message }, { status: 500 });
  }

  return NextResponse.json({ channel }, { status: 201 });
}

