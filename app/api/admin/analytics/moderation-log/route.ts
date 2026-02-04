import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin, logModerationAction } from '../../community/utils';

const DEFAULT_LIMIT = 50;

function toCsv(rows: any[]) {
  if (!rows.length) return 'timestamp,admin,action_type,target_user,target_message,channel,reason,duration';
  const header = ['timestamp', 'admin', 'action_type', 'target_user', 'target_message', 'channel', 'reason', 'duration'];
  const lines = rows.map((r) =>
    [
      r.created_at,
      r.admin?.email || r.admin?.name || r.admin_id || '',
      r.action_type,
      r.user?.email || r.user?.name || r.user_id || '',
      r.message_id || '',
      r.channel?.name || r.channel?.slug || '',
      (r.reason || '').replace(/"/g, '""'),
      r.metadata?.expires_at || '',
    ].join(',')
  );
  return [header.join(','), ...lines].join('\n');
}

export async function GET(request: NextRequest) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase, adminId } = ctx;

  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  let limit = parseInt(searchParams.get('limit') || `${DEFAULT_LIMIT}`, 10);
  limit = Math.min(Math.max(limit, 1), 200);
  const offset = (page - 1) * limit;
  const range = { from: offset, to: offset + limit - 1 };

  const actionType = searchParams.get('action_type');
  const q = searchParams.get('q');
  const adminFilter = searchParams.get('admin_id');
  const dateFrom = searchParams.get('from');
  const dateTo = searchParams.get('to');
  const format = searchParams.get('format');

  let query = supabase
    .from('moderation_actions')
    .select(
      `
        id,
        action_type,
        reason,
        created_at,
        admin_id,
        user_id,
        message_id,
        channel_id,
        metadata,
        admin:profiles!moderation_actions_admin_id_fkey (id, name, email),
        user:profiles!moderation_actions_user_id_fkey (id, name, email),
        channel:community_channels!moderation_actions_channel_id_fkey (id, name, slug)
      `,
      { count: 'exact' }
    )
    .order('created_at', { ascending: false })
    .range(range.from, range.to);

  if (actionType) query = query.eq('action_type', actionType);
  if (adminFilter) query = query.eq('admin_id', adminFilter);
  if (q) {
    query = query.or(
      `reason.ilike.%${q}%,action_type.ilike.%${q}%,message_id.ilike.%${q}%,user_id.ilike.%${q}%,admin_id.ilike.%${q}%`
    );
  }
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) query = query.lte('created_at', dateTo);

  const { data, error: queryError, count } = await query;
  if (queryError) {
    return NextResponse.json({ error: 'Failed to load moderation actions', details: queryError.message }, { status: 500 });
  }

  if (format === 'csv') {
    await logModerationAction(supabase, adminId, {
      action_type: 'export_moderation_log',
      reason: 'CSV export from analytics',
    });
    const csv = toCsv(data || []);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': 'attachment; filename="moderation-log.csv"',
      },
    });
  }

  return NextResponse.json({
    actions: data || [],
    total: count || 0,
    page,
    limit,
  });
}

