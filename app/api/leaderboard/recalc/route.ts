import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createClient()

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, xp')
    .order('xp', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (!users) return NextResponse.json({ success: true, updated: 0 })

  let rank = 1
  for (const user of users) {
    await supabase.from('profiles').update({ rank_position: rank }).eq('id', user.id)
    rank += 1
  }

  return NextResponse.json({ success: true, updated: users.length })
}

