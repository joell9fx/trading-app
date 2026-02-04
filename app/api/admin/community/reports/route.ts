import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '../utils';

export async function GET(request: NextRequest) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || undefined;
  let limit = parseInt(searchParams.get('limit') || '100', 10);
  limit = Math.min(Math.max(limit, 1), 200);

  let query = supabase
    .from('reports')
    .select(
      `
        id,
        status,
        reason,
        created_at,
        reporter_id,
        reviewed_by,
        reviewed_at,
        message:messages!reports_message_id_fkey (
          id,
          content,
          channel_id,
          author_id,
          created_at,
          deleted_at,
          profiles:profiles!messages_author_id_fkey (
            id, name, role, email
          )
        )
      `
    )
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('status', status);

  const { data, error: queryError } = await query;
  if (queryError) {
    return NextResponse.json({ error: 'Failed to load reports', details: queryError.message }, { status: 500 });
  }

  return NextResponse.json({ reports: data || [] });
}

