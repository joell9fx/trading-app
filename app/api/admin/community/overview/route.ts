import { NextResponse } from 'next/server';
import { requireAdmin } from '../utils';

export async function GET() {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;

  const { supabase } = ctx;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [usersRes, channelsRes, messagesTodayRes, recentMessagesRes, reportsRes] =
    await Promise.all([
      supabase.from('profiles').select('id', { count: 'exact', head: true }),
      supabase.from('community_channels').select('id, name, slug, is_private'),
      supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', today.toISOString())
        .is('deleted_at', null),
      supabase
        .from('messages')
        .select(
          `
            id,
            content,
            created_at,
            channel_id,
            author_id,
            is_pinned,
            deleted_at,
            profiles:profiles!messages_author_id_fkey (
              id, name, full_name, email, role, avatar_url
            )
          `
        )
        .order('created_at', { ascending: false })
        .limit(25),
      supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    ]);

  const activeWindow = new Date(Date.now() - 1000 * 60 * 15).toISOString();
  const { data: activeUsers } = await supabase
    .from('messages')
    .select('author_id')
    .gte('created_at', activeWindow)
    .is('deleted_at', null);

  return NextResponse.json({
    metrics: {
      totalUsers: usersRes.count || 0,
      activeChannels: channelsRes.data?.length || 0,
      messagesToday: messagesTodayRes.count || 0,
      activeUsersOnline: new Set((activeUsers || []).map((m: any) => m.author_id)).size,
      pendingReports: reportsRes.count || 0,
    },
    channels: channelsRes.data || [],
    recentMessages: recentMessagesRes.data || [],
  });
}

