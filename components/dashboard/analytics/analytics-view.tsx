'use client'

import { useEffect, useMemo, useState } from 'react'
import { EquityCurve } from './equity-curve'
import { WinLossPie } from './win-loss-pie'
import { PairPerformanceBar } from './pair-performance-bar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface Trade {
  id: string
  created_at: string
  pair: string
  result: string
  risk_reward?: number | null
  profit?: number | null
}

export function AnalyticsView({ trades }: { trades: Trade[] }) {
  const { toast } = useToast()
  const [insights, setInsights] = useState<string>('')
  const [loadingInsights, setLoadingInsights] = useState(false)

  const wins = trades.filter((t) => t.result === 'win').length
  const losses = trades.filter((t) => t.result === 'loss').length
  const breakevens = trades.filter((t) => t.result === 'breakeven').length
  const total = trades.length
  const winRate = total ? Math.round((wins / total) * 100) : 0
  const avgRR = total ? trades.reduce((sum, t) => sum + (Number(t.risk_reward) || 0), 0) / total : 0
  const totalProfit = trades.reduce((sum, t) => sum + (Number(t.profit) || 0), 0)

  const equityCurve = useMemo(() => {
    let running = 0
    return trades.map((t) => {
      running += Number(t.profit) || 0
      return { created_at: t.created_at, profit: running }
    })
  }, [trades])

  const pairStats = useMemo(() => {
    const map: Record<string, number> = {}
    trades.forEach((t) => {
      map[t.pair] = (map[t.pair] || 0) + (Number(t.profit) || 0)
    })
    return Object.entries(map).map(([pair, profit]) => ({ pair, profit }))
  }, [trades])

  const fetchInsights = async () => {
    setLoadingInsights(true)
    try {
      const res = await fetch('/api/analytics/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trades }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to get insights')
      setInsights(json.insights || '')
    } catch (error: any) {
      toast({ title: 'AI unavailable', description: error?.message || 'Could not fetch insights', variant: 'destructive' })
    } finally {
      setLoadingInsights(false)
    }
  }

  useEffect(() => {
    if (trades.length > 0) {
      fetchInsights()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="bg-black border border-gold-500/50 p-4 rounded-2xl">
          <h3 className="text-gold-400 font-semibold mb-2">Performance Summary</h3>
          <div className="grid grid-cols-2 gap-3 text-white">
            <div>
              <p className="text-2xl font-bold">{winRate}%</p>
              <p className="text-xs text-gray-400">Win Rate</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{(avgRR || 0).toFixed(2)}</p>
              <p className="text-xs text-gray-400">Avg R:R</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProfit.toFixed(2)}</p>
              <p className="text-xs text-gray-400">Total Profit</p>
            </div>
            <div>
              <p className="text-2xl font-bold">{trades.length}</p>
              <p className="text-xs text-gray-400">Trades</p>
            </div>
          </div>
        </Card>

        <Card className="bg-gray-900 border border-gray-800 p-4 rounded-2xl lg:col-span-2">
          <div className="flex items-center justify-between">
            <h3 className="text-gold-400 font-semibold">AI Performance Insights</h3>
            <Button variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300" onClick={fetchInsights} disabled={loadingInsights}>
              {loadingInsights ? 'Generating...' : 'Refresh'}
            </Button>
          </div>
          <div className="mt-3 text-gray-300 whitespace-pre-line min-h-[80px]">
            {insights || 'No insights yet.'}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <EquityCurve data={equityCurve} />
        <WinLossPie wins={wins} losses={losses} breakevens={breakevens} />
      </div>

      <div className="grid grid-cols-1">
        <PairPerformanceBar data={pairStats} />
      </div>
    </div>
  )
}

