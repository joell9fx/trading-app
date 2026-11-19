import { NextRequest, NextResponse } from 'next/server';
import { logModerationAction, requireAdmin } from '../../utils';
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'
import { parseBody } from '@/lib/api/parse-body'

function computeExpiry(minutes?: number | null) {
  if (!minutes || Number.isNaN(minutes)) return null;
  const dt = new Date();
  dt.setMinutes(dt.getMinutes() + minutes);
  return dt.toISOString();
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { adminId } = ctx;
  const supabase = createAdminClient(); // service role: cross-user write, caller already verified

  const body = await parseBody(
    request,
    z.object({
      action: z.enum(['mute', 'ban', 'unban', 'unmute', 'role']),
      reason: z.string().trim().max(500).optional(),
      // Up to one year
      durationMinutes: z.coerce.number().int().positive().max(525_600).optional().nullable(),
      role: z.string().trim().max(32).optional(),
    }),
  );
  if (body.error) return body.error;
  const { action, reason, durationMinutes, role } = body.data;

  if (!action) {
    return NextResponse.json({ error: 'Action required' }, { status: 400 });
  }

  const userId = params.userId;

  // Ensure user exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', userId)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  if (action === 'role') {
    // Roles are lowercase since migration 041; owner is assigned via superadmin only.
    const validRoles = ['member', 'admin'];
    const normalizedRole = typeof role === 'string' ? role.toLowerCase() : '';
    if (!validRoles.includes(normalizedRole)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    if (userId === adminId && normalizedRole !== 'admin') {
      return NextResponse.json({ error: 'Cannot demote yourself' }, { status: 400 });
    }

    const { error: updateError, data: updated } = await supabase
      .from('profiles')
      .update({ role: normalizedRole })
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update role', details: updateError.message }, { status: 500 });
    }

    await logModerationAction(supabase, adminId, {
      user_id: userId,
      action_type: 'change_role',
      reason: reason || `Role -> ${normalizedRole}`,
    });

    return NextResponse.json({ user: updated, action: 'role' });
  }

  if (action === 'ban') {
    const expires_at = computeExpiry(durationMinutes);
    const { error: insertError, data: ban } = await supabase
      .from('bans')
      .insert({
        user_id: userId,
        admin_id: adminId,
        reason: reason || 'Banned by admin',
        expires_at,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to ban user', details: insertError.message }, { status: 500 });
    }

    await logModerationAction(supabase, adminId, {
      user_id: userId,
      action_type: 'ban',
      reason,
      metadata: { expires_at },
    });

    return NextResponse.json({ ban, action: 'ban' });
  }

  if (action === 'mute') {
    const expires_at = computeExpiry(durationMinutes || 60);
    const { error: insertError, data: mute } = await supabase
      .from('muted_users')
      .insert({
        user_id: userId,
        admin_id: adminId,
        reason: reason || 'Muted by admin',
        expires_at,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: 'Failed to mute user', details: insertError.message }, { status: 500 });
    }

    await logModerationAction(supabase, adminId, {
      user_id: userId,
      action_type: 'mute',
      reason,
      metadata: { expires_at },
    });

    return NextResponse.json({ mute, action: 'mute' });
  }

  if (action === 'unban') {
    await supabase
      .from('bans')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);

    await logModerationAction(supabase, adminId, {
      user_id: userId,
      action_type: 'unban',
      reason,
    });

    return NextResponse.json({ action: 'unban' });
  }

  if (action === 'unmute') {
    await supabase
      .from('muted_users')
      .update({ revoked_at: new Date().toISOString() })
      .eq('user_id', userId)
      .is('revoked_at', null);

    await logModerationAction(supabase, adminId, {
      user_id: userId,
      action_type: 'unmute',
      reason,
    });

    return NextResponse.json({ action: 'unmute' });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}

