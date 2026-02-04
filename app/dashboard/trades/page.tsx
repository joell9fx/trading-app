import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { TradesWithReplay } from '@/components/dashboard/trades-with-replay'
import { TradeLogForm } from '@/components/dashboard/trade-log-form'
import { TradingStatsCard } from '@/components/dashboard/trading-stats-card'
import { updatePerformanceStats } from '@/lib/performance'

export const dynamic = 'force-dynamic'

export default async function TradesPage() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/signin?redirectTo=/dashboard/trades')
  }

  const { data: trades } = await supabase
    .from('user_trades')
    .select('id, pair, entry_time, exit_time, stop_loss, take_profit, entry_price, exit_price, result, risk_reward, ai_feedback, feedback_sentiment')
    .eq('user_id', user.id)
    .order('entry_time', { ascending: false })
    .limit(50)

  const stats = await updatePerformanceStats(supabase, user.id).catch(() => null)

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-4">Trade Replays</h1>
      <p className="text-gray-400 mb-6">Replay your trades with candle-by-candle playback and AI commentary.</p>
      {stats && <div className="mb-6"><TradingStatsCard stats={stats} /></div>}
      <div className="mb-6">
        <TradeLogForm />
      </div>
      <TradesWithReplay trades={trades || []} />
    </div>
  )
}

