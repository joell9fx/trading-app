import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { parseBody, idSchema } from '@/lib/api/parse-body'

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
    const body = await parseBody(req, z.object({ post_id: idSchema, comment: z.string().trim().min(1).max(2000) }))
    if (body.error) return body.error
    const { post_id, comment } = body.data

    const { error } = await supabase.from('showcase_comments').insert([{ user_id: user.id, post_id, comment }])
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    try {
      await supabase.rpc('increment_xp', { user_id: user.id, amount: 2, reason: 'Community Engagement' })
    } catch (xpErr) {
      console.error('increment_xp error', xpErr)
    }
    try {
      await supabase.rpc('increment_field', {
        table_name: 'user_showcase_posts',
        field_name: 'comments_count',
        row_id: post_id,
      })
    } catch (countErr) {
      console.error('increment_field error', countErr)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('showcase comment error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

