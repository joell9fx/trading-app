import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(_req: NextRequest, { params }: { params: { username: string } }) {
  const supabase = createClient()
  const username = params.username

  const { data: user, error } = await supabase
    .from('profiles')
    .select('id, username, bio, avatar_url, xp, membership_tier, is_profile_public, badges, created_at')
    .eq('username', username)
    .single()

  if (error || !user || user.is_profile_public === false) {
    return NextResponse.json({ error: 'Profile not available' }, { status: 403 })
  }

  const { data: journal } = await supabase
    .from('mentor_journal')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  const { data: showcase } = await supabase
    .from('user_showcase_posts')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(3)

  return NextResponse.json({
    user,
    badges: { badges: user.badges || [] },
    journal: journal || [],
    showcase: showcase || [],
  })
}

