import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../utils';

export async function GET(request: NextRequest) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const { searchParams } = new URL(request.url);
  const channelId = searchParams.get('channel_id');
  const search = searchParams.get('q');
  const includeDeleted = searchParams.get('include_deleted') === 'true';
  let limit = parseInt(searchParams.get('limit') || '100', 10);
  limit = Math.min(Math.max(limit, 1), 200);

  let query = supabase
    .from('messages')
    .select(
      `
        id,
        content,
        created_at,
        updated_at,
        deleted_at,
        attachments,
        author_id,
        channel_id,
        is_pinned,
        profiles:profiles!messages_author_id_fkey (
          id, name, full_name, email, role, avatar_url
        ),
        channel:community_channels!messages_channel_id_fkey (
          id, name, slug, category
        )
      `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (channelId) query = query.eq('channel_id', channelId);
  if (!includeDeleted) query = query.is('deleted_at', null);
  if (search) query = query.ilike('content', `%${search}%`);

  const { data, error: queryError } = await query;
  if (queryError) {
    return NextResponse.json({ error: 'Failed to load messages', details: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ messages: data || [] });
}

