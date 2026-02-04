import { NextResponse } from 'next/server';
import { requireAdmin as baseRequireAdmin } from '../auth';
import { createClient } from '@/lib/supabase/server';

export interface AdminContext {
  supabase: ReturnType<typeof createClient>;
  adminId: string;
}

export async function requireAdmin(): Promise<{ error?: NextResponse; ctx?: AdminContext }> {
  const adminCheck = await baseRequireAdmin();
  if (adminCheck.error) return { error: adminCheck.error };
  const { supabase, user } = adminCheck.ctx!;
  return { ctx: { supabase, adminId: user.id } };
}

export function isActiveRecord(expires_at: string | null, revoked_at: string | null) {
  if (revoked_at) return false;
  if (!expires_at) return true;
  return new Date(expires_at) > new Date();
}

export async function logModerationAction(
  supabase: ReturnType<typeof createClient>,
  adminId: string,
  payload: {
    user_id?: string | null;
    message_id?: string | null;
    channel_id?: string | null;
    action_type: string;
    reason?: string | null;
    metadata?: Record<string, any>;
  }
) {
  await supabase.from('moderation_actions').insert({
    admin_id: adminId,
    user_id: payload.user_id || null,
    message_id: payload.message_id || null,
    channel_id: payload.channel_id || null,
    action_type: payload.action_type,
    reason: payload.reason || null,
    metadata: payload.metadata || {},
  });
}

