import { NextRequest, NextResponse } from 'next/server';
import { logModerationAction, requireAdmin } from '../../utils';

// GET returns a message plus recent channel context
export async function GET(
  _request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const { data: message, error: messageError } = await supabase
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
        )
      `
    )
    .eq('id', params.messageId)
    .single();

  if (messageError || !message) {
    return NextResponse.json({ error: 'Message not found' }, { status: 404 });
  }

  const { data: context } = await supabase
    .from('messages')
    .select(
      `
        id,
        content,
        created_at,
        author_id,
        channel_id,
        deleted_at,
        profiles:profiles!messages_author_id_fkey (
          id, name, role, avatar_url
        )
      `
    )
    .eq('channel_id', message.channel_id)
    .order('created_at', { ascending: false })
    .limit(40);

  return NextResponse.json({ message, context: context || [] });
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { messageId: string } }
) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase, adminId } = ctx;

  const body = await request.json();
  const action = body?.action as 'delete' | 'restore' | 'pin' | 'unpin' | 'flag';
  const reason = body?.reason as string | undefined;

  if (!action) {
    return NextResponse.json({ error: 'Action is required' }, { status: 400 });
  }

  const messageId = params.messageId;

  if (action === 'flag') {
    const { data: report, error: reportError } = await supabase
      .from('reports')
      .insert({
        message_id: messageId,
        reporter_id: adminId,
        reason: reason || 'Flagged by admin',
      })
      .select()
      .single();

    if (reportError) {
      return NextResponse.json({ error: 'Failed to flag message', details: reportError.message }, { status: 500 });
    }

    await logModerationAction(supabase, adminId, {
      message_id: messageId,
      action_type: 'flag',
      reason,
    });

    return NextResponse.json({ report, action: 'flag' });
  }

  const now = new Date().toISOString();
  const updates =
    action === 'delete'
      ? { deleted_at: now, updated_at: now }
      : action === 'restore'
      ? { deleted_at: null, updated_at: now }
      : { is_pinned: action === 'pin', updated_at: now };

  const { data: message, error: updateError } = await supabase
    .from('messages')
    .update(updates)
    .eq('id', messageId)
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
        is_pinned
      `
    )
    .single();

  if (updateError) {
    return NextResponse.json({ error: 'Failed to update message', details: updateError.message }, { status: 500 });
  }

  await logModerationAction(supabase, adminId, {
    message_id: messageId,
    channel_id: message?.channel_id,
    action_type: action,
    reason,
  });

  return NextResponse.json({ message, action });
}

