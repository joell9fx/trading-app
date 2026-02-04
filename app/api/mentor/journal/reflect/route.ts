import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

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
    const { journal_id, reflection } = await req.json()
    if (!journal_id || !reflection) {
      return NextResponse.json({ error: 'journal_id and reflection are required' }, { status: 400 })
    }

    const { error } = await supabase.from('user_reflections').insert([
      {
        journal_id,
        user_id: user.id,
        reflection,
      },
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('reflect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

