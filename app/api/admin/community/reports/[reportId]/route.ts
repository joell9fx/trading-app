import { NextRequest, NextResponse } from 'next/server';
import { logModerationAction, requireAdmin } from '../../utils';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { reportId: string } }
) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase, adminId } = ctx;

  const body = await request.json();
  const action = body?.action as 'review' | 'dismiss' | 'remove';
  const reason = body?.reason as string | undefined;

  if (!action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 });
  }

  const updates: Record<string, any> = {
    status: action === 'review' ? 'reviewed' : action === 'dismiss' ? 'dismissed' : 'removed',
    reviewed_by: adminId,
    reviewed_at: new Date().toISOString(),
  };

  const { data: report, error: updateError } = await supabase
    .from('reports')
    .update(updates)
    .eq('id', params.reportId)
    .select('id, message_id, status, reviewed_at, reviewed_by')
    .single();

  if (updateError || !report) {
    return NextResponse.json({ error: 'Failed to update report', details: updateError?.message }, { status: 500 });
  }

  if (action === 'remove' && report.message_id) {
    await supabase
      .from('messages')
      .update({ deleted_at: new Date().toISOString(), updated_at: new Date().toISOString() })
      .eq('id', report.message_id);
  }

  await logModerationAction(supabase, adminId, {
    message_id: report.message_id,
    action_type: `report_${action}`,
    reason,
  });

  return NextResponse.json({ report, action });
}

