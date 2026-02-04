import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const supabase = createClient()

  try {
    const { searchParams } = new URL(req.url)
    const scope = searchParams.get('scope') || 'all'

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const query = supabase
      .from('user_showcase_posts')
      .select('*, profiles!user_showcase_posts_user_id_fkey(id, name, full_name, avatar_url)')
      .order('created_at', { ascending: false })
      .limit(50)

    if (scope === 'mine') {
      query.eq('user_id', user.id)
    }

    const { data, error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ posts: data || [] })
  } catch (error) {
    console.error('showcase list error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

