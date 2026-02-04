import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP } from '@/lib/xp-utils'
import { assignBadges } from '@/lib/badges'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await req.json()
    if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

    const { error } = await supabase
      .from('learning_paths')
      .update({ status: 'completed', progress: 100 })
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 400 })

    try {
      await addXP(supabase, user.id, 30, 'Lesson Completed')
      await assignBadges(supabase, user.id)
    } catch (e) {
      // best effort
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('complete learning path error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

