import { NextRequest, NextResponse } from 'next/server';
import { isActiveRecord, requireAdmin } from '../utils';

export async function GET(request: NextRequest) {
  const { error, ctx } = await requireAdmin();
  if (error || !ctx) return error!;
  const { supabase } = ctx;

  const { searchParams } = new URL(request.url);
  const role = searchParams.get('role');
  const status = searchParams.get('status'); // active | banned | muted
  const joinedFrom = searchParams.get('joined_from');
  const joinedTo = searchParams.get('joined_to');

  let profileQuery = supabase
    .from('profiles')
    .select('id, email, name, full_name, role, created_at, updated_at');

  if (role) profileQuery = profileQuery.eq('role', role);
  if (joinedFrom) profileQuery = profileQuery.gte('created_at', joinedFrom);
  if (joinedTo) profileQuery = profileQuery.lte('created_at', joinedTo);

  const { data: profiles, error: profileError } = await profileQuery;
  if (profileError) {
    return NextResponse.json({ error: 'Failed to load users', details: profileError.message }, { status: 500 });
  }

  const [{ data: bans }, { data: mutes }] = await Promise.all([
    supabase.from('bans').select('user_id, reason, expires_at, revoked_at, created_at'),
    supabase.from('muted_users').select('user_id, reason, expires_at, revoked_at, created_at'),
  ]);

  const activeBans = new Map(
    (bans || [])
      .filter((b) => isActiveRecord(b.expires_at, b.revoked_at))
      .map((b) => [b.user_id, b])
  );
  const activeMutes = new Map(
    (mutes || [])
      .filter((m) => isActiveRecord(m.expires_at, m.revoked_at))
      .map((m) => [m.user_id, m])
  );

  const { data: recentMessages } = await supabase
    .from('messages')
    .select('author_id, created_at')
    .order('created_at', { ascending: false })
    .limit(400);

  const lastActiveMap = new Map<string, string>();
  (recentMessages || []).forEach((msg: any) => {
    if (!lastActiveMap.has(msg.author_id)) {
      lastActiveMap.set(msg.author_id, msg.created_at);
    }
  });

  let rows = (profiles || []).map((p) => {
    const ban = activeBans.get(p.id);
    const mute = activeMutes.get(p.id);
    const statusValue = ban ? 'banned' : mute ? 'muted' : 'active';
    return {
      ...p,
      status: statusValue,
      ban,
      mute,
      last_active: lastActiveMap.get(p.id) || p.updated_at || p.created_at,
    };
  });

  if (status === 'banned') rows = rows.filter((r) => r.status === 'banned');
  if (status === 'muted') rows = rows.filter((r) => r.status === 'muted');
  if (status === 'active') rows = rows.filter((r) => r.status === 'active');

  return NextResponse.json({ users: rows, count: rows.length });
}

