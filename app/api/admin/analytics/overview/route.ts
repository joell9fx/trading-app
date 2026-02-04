import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../../community/utils';

function parseRange(searchParams: URLSearchParams) {
  const range = searchParams.get('range');
  if (range === '7') return 7;
  if (range === 'all') return 365;
  return 30;
}

export async function GET(request: NextRequest) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const { searchParams } = new URL(request.url);
  const days = parseRange(searchParams);
  const now = new Date();
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();

  const [
    usersCount,
    messagesCount,
    activeChannels,
    bans7d,
    pendingReports,
    messagesOverTime,
    topChannels,
    moderationSummary,
    activeUsers,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', windowStart)
      .is('deleted_at', null),
    supabase
      .from('community_channels')
      .select('id', { count: 'exact', head: true })
      .is('archived_at', null),
    supabase
      .from('bans')
      .select('id', { count: 'exact', head: true })
      .gte('created_at', new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .is('revoked_at', null),
    supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase
      .from('daily_message_count')
      .select('day, message_count, unique_authors')
      .gte('day', windowStart)
      .order('day', { ascending: true }),
    supabase.from('top_channels_by_message_count').select('channel_id, channel_name, message_count, slug'),
    supabase.from('moderation_summary_by_type').select('action_type, action_count'),
    supabase.from('active_users_per_day').select('day, active_users').gte('day', windowStart).order('day', { ascending: true }),
  ]);

  const activeWindow = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
  const { data: activeUserRows } = await supabase
    .from('messages')
    .select('author_id')
    .gte('created_at', activeWindow)
    .is('deleted_at', null);
  const activeUsersOnline = new Set((activeUserRows || []).map((r: any) => r.author_id)).size;

  return NextResponse.json({
    metrics: {
      totalUsers: usersCount.count || 0,
      messagesWindow: messagesCount.count || 0,
      activeChannels: activeChannels.count || 0,
      bans7d: bans7d.count || 0,
      pendingReports: pendingReports.count || 0,
      activeUsersOnline,
      rangeDays: days,
    },
    charts: {
      messagesOverTime: messagesOverTime.data || [],
      topChannels: topChannels.data || [],
      moderationSummary: moderationSummary.data || [],
      activeUsers: activeUsers.data || [],
    },
  });
}

