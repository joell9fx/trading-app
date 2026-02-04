import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { addXP } from '@/lib/xp-utils'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = createClient()
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: stats, error } = await supabase
    .from('community_activity')
    .select('user_id, xp_earned')
    .gte('created_at', sevenDaysAgo)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  if (!stats || stats.length === 0) {
    return NextResponse.json({ success: true, awarded: 0 })
  }

  const xpByUser: Record<string, number> = {}
  stats.forEach((row) => {
    xpByUser[row.user_id] = (xpByUser[row.user_id] || 0) + (row.xp_earned || 0)
  })

  const top = Object.entries(xpByUser)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)

  for (const [userId] of top) {
    try {
      await addXP(supabase, userId, 50, 'Weekly Top 3')
      await supabase.from('notifications').insert([
        {
          user_id: userId,
          type: 'xp',
          title: '🏆 Weekly Top Contributor',
          message: 'You earned +50 XP for being among the most active community members!',
        },
      ])
    } catch (e) {
      console.error('Weekly leaderboard award error:', e)
    }
  }

  return NextResponse.json({ success: true, awarded: top.length })
}

