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
    const { post_id } = await req.json()
    if (!post_id) {
      return NextResponse.json({ error: 'post_id is required' }, { status: 400 })
    }

    const { error } = await supabase.rpc('increment_field', { table_name: 'user_showcase_posts', field_name: 'likes', row_id: post_id })
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('showcase like error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

