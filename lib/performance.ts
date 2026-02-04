import { SupabaseClient } from '@supabase/supabase-js'
import { addXP } from './xp-utils'
import { assignBadges } from './badges'

export async function updatePerformanceStats(supabase: SupabaseClient, userId: string) {
  const { data: trades, error } = await supabase
    .from('user_trades')
    .select('result, risk_reward, profit, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error) throw error

  const total_trades = trades?.length || 0
  const wins = trades?.filter((t) => t.result === 'win').length || 0
  const losses = trades?.filter((t) => t.result === 'loss').length || 0
  const breakevens = trades?.filter((t) => t.result === 'breakeven').length || 0
  const avg_rr =
    trades && trades.length > 0
      ? trades.reduce((sum, t) => sum + (Number(t.risk_reward) || 0), 0) / trades.length
      : 0
  const win_rate = total_trades > 0 ? (wins / total_trades) * 100 : 0
  const total_profit = trades?.reduce((sum, t) => sum + (Number(t.profit) || 0), 0) || 0

  const consistency_score = calculateConsistency(trades || [])

  await supabase
    .from('performance_stats')
    .upsert({
      user_id: userId,
      total_trades,
      wins,
      losses,
      breakevens,
      avg_rr,
      win_rate,
      total_profit,
      consistency_score,
      updated_at: new Date().toISOString(),
    })

  try {
    await assignBadges(supabase, userId)
  } catch (e) {
    // best effort
  }

  return { total_trades, wins, losses, breakevens, avg_rr, win_rate, total_profit, consistency_score }
}

export function calculateConsistency(trades: any[]) {
  const last20 = trades.slice(-20)
  const wins = last20.filter((t) => t.result === 'win').length
  const losses = last20.filter((t) => t.result === 'loss').length
  const total = wins + losses
  if (total === 0) return 0
  return Math.round((wins / total) * 100)
}

export async function handleTradeXP(
  supabase: SupabaseClient,
  userId: string,
  result: string,
  risk_reward?: number,
  beforeCount?: number
) {
  let xp = 0
  if (beforeCount === 0) xp += 10 // first trade
  if (result === 'win') xp += 5
  if ((risk_reward || 0) >= 2) xp += 10

  // Consistency milestone every 10 trades
  if (beforeCount !== undefined && (beforeCount + 1) % 10 === 0) {
    xp += 15
  }

  if (xp > 0) {
    await addXP(supabase, userId, xp, 'Trade Performance')
  }
}

