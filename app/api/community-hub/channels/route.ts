import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';

const channelSchema = z.object({
  name: z.string().min(2).max(80),
  description: z.string().max(280).optional().nullable(),
  category: z.enum(['general', 'forex', 'crypto', 'signals', 'mentorship', 'announcements']).default('general'),
  is_private: z.boolean().optional().default(false),
});

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function getUserWithRole() {
  const supabase = createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: 'Unauthorized', status: 401 } as const;
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select(
      'role, is_admin, is_owner, banned, has_signals_access, has_mentorship_access, has_funding_access, has_ai_tools_access'
    )
    .eq('id', user.id)
    .single();

  return { user, role: profile?.role || 'MEMBER', profile, supabase } as const;
}

function canAccessChannel(
  user: {
    role?: string;
    is_admin?: boolean;
    is_owner?: boolean;
    banned?: boolean;
    has_signals_access?: boolean;
    has_mentorship_access?: boolean;
    has_funding_access?: boolean;
  },
  channelSlug?: string | null
) {
  if (user?.banned) return false;
  const isElevated = user?.role === 'ADMIN' || user?.role === 'MODERATOR' || user?.is_admin || user?.is_owner;
  if (isElevated) return true;

  const key = (channelSlug || '').toLowerCase();
  if (key === 'general') return true;
  if (key === 'signals' || key.includes('signal')) return !!user?.has_signals_access;
  if (key === 'mentorship' || key.includes('mentor')) return !!user?.has_mentorship_access;
  if (key === 'funding') return !!user?.has_funding_access;
  return true;
}

// GET /api/community-hub/channels
export async function GET() {
  const ctx = await getUserWithRole();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { supabase, role, profile } = ctx;
  const requester = { ...profile, role };
  if (requester?.banned) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }

  const isAdmin = role === 'ADMIN' || role === 'MODERATOR' || profile?.is_admin || profile?.is_owner;
  const includePrivate = isAdmin;

  const { data: channels, error } = await supabase
    .from('community_channels')
    .select('id, name, description, slug, category, is_private, created_by, created_at, updated_at')
    .order('category', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to load channels', details: error.message }, { status: 500 });
  }

  const visibleChannels = (channels || []).filter((ch) => {
    if (ch.is_private && !includePrivate) return false;
    return canAccessChannel(requester, ch.slug || ch.category);
  });

  return NextResponse.json({
    channels: visibleChannels,
    canManage: isAdmin,
  });
}

// POST /api/community-hub/channels
export async function POST(request: NextRequest) {
  const ctx = await getUserWithRole();
  if ('error' in ctx) {
    return NextResponse.json({ error: ctx.error }, { status: ctx.status });
  }

  const { role, supabase, user, profile } = ctx;
  const requester = { ...profile, role };
  const isAdmin = role === 'ADMIN' || role === 'MODERATOR' || profile?.is_admin || profile?.is_owner;
  if (requester?.banned) {
    return NextResponse.json({ error: 'No access' }, { status: 403 });
  }
  if (!isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const parsed = channelSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const slug = slugify(parsed.data.name);
  if (!slug) {
    return NextResponse.json({ error: 'Channel name must produce a valid slug' }, { status: 400 });
  }

  const insertPayload = {
    name: parsed.data.name,
    description: parsed.data.description || null,
    category: parsed.data.category,
    is_private: parsed.data.is_private ?? false,
    slug,
    created_by: user.id,
  };

  const { data: channel, error } = await supabase
    .from('community_channels')
    .upsert(insertPayload, { onConflict: 'slug' })
    .select('*')
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to save channel', details: error.message }, { status: 500 });
  }

  return NextResponse.json({ channel }, { status: 201 });
}

