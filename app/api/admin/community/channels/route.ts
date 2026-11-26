import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../utils';
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'
import { serverError } from '@/lib/api/errors'

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
    return serverError(channelError, 'admin/community/channels', 500, 'Failed to load channels');
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

  const body = await parseBody(
    request,
    z.object({
      name: z.string().trim().min(2, 'Channel name is required').max(80),
      description: z.string().trim().max(500).nullable().optional(),
      category: z.string().trim().min(1).max(40).default('general'),
      is_private: z.boolean().default(false),
    }),
  );
  if (body.error) return body.error;
  const { name, description, category, is_private } = body.data;

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
    return serverError(insertError, 'admin/community/channels', 500, 'Failed to save channel');
  }

  return NextResponse.json({ channel }, { status: 201 });
}

