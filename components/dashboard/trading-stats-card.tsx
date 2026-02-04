'use client'

import { Card } from '@/components/ui/card'

interface TradingStatsCardProps {
  stats: {
    win_rate?: number
    avg_rr?: number
    consistency_score?: number
    total_trades?: number
    wins?: number
    losses?: number
  }
}

export function TradingStatsCard({ stats }: TradingStatsCardProps) {
  return (
    <Card className="bg-black border border-gold-500/50 p-6 rounded-2xl text-center shadow-[0_0_25px_rgba(255,215,0,0.08)]">
      <h2 className="text-gold-400 text-xl font-bold mb-2">Trading Performance</h2>
      <p className="text-gray-400 mb-4">Track your win rate, average R:R, and consistency.</p>
      <div className="grid grid-cols-3 gap-4 text-white">
        <div>
          <p className="text-2xl font-bold">{Math.round(stats.win_rate || 0)}%</p>
          <span className="text-sm text-gray-400">Win Rate</span>
        </div>
        <div>
          <p className="text-2xl font-bold">{(stats.avg_rr || 0).toFixed(2)}</p>
          <span className="text-sm text-gray-400">Avg R:R</span>
        </div>
        <div>
          <p className="text-2xl font-bold">{Math.round(stats.consistency_score || 0)}</p>
          <span className="text-sm text-gray-400">Consistency</span>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-4 text-white">
        <div>
          <p className="text-lg font-semibold">{stats.total_trades || 0}</p>
          <span className="text-xs text-gray-400">Trades</span>
        </div>
        <div>
          <p className="text-lg font-semibold">{stats.wins || 0}</p>
          <span className="text-xs text-gray-400">Wins</span>
        </div>
        <div>
          <p className="text-lg font-semibold">{stats.losses || 0}</p>
          <span className="text-xs text-gray-400">Losses</span>
        </div>
      </div>
    </Card>
  )
}

