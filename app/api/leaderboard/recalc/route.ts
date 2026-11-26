import { NextResponse, type NextRequest } from 'next/server'
import { requireAdminOrInternal } from '@/lib/api/internal-auth'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const { error: authError, supabase } = await requireAdminOrInternal(req)
  if (authError || !supabase) return authError

  const { data: users, error } = await supabase
    .from('profiles')
    .select('id, xp')
    .order('xp', { ascending: false })

  if (error) {
    return serverError(error, 'leaderboard/recalc', 400)
  }

  if (!users) return NextResponse.json({ success: true, updated: 0 })

  let rank = 1
  for (const user of users) {
    await supabase.from('profiles').update({ rank_position: rank }).eq('id', user.id)
    rank += 1
  }

  return NextResponse.json({ success: true, updated: users.length })
}

