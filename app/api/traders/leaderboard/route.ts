import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { serverError } from '@/lib/api/errors'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('performance_stats')
    .select('user_id, win_rate, consistency_score, total_trades, avg_rr, total_profit, profiles:profiles!performance_stats_user_id_fkey(id, name, full_name, username, membership_tier, xp, badges)')
    .order('consistency_score', { ascending: false })
    .order('win_rate', { ascending: false })
    .limit(50)

  if (error) {
    return serverError(error, 'traders/leaderboard', 400)
  }

  return NextResponse.json({ traders: data || [] })
}

