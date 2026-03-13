'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Filter, Sparkles, Target, TrendingUp, Activity, CheckCircle2 } from 'lucide-react'
import { SignalsPerformance } from './signals-performance'
import { SignalsHistory } from './signals-history'
import { SignalsEquityCurve } from './signals-equity-curve'
import { SignalsAnalyticsCards } from './signals-analytics-cards'
import { useSignalsDashboard, type SignalFeedItem } from './use-signals-dashboard'

type SignalStatus = 'new' | 'active' | 'closed'

const statusTone = {
  new: 'bg-amber-500/15 text-amber-200 border-amber-400/30',
  active: 'bg-blue-500/15 text-blue-200 border-blue-400/30',
  closed: 'bg-emerald-500/15 text-emerald-200 border-emerald-400/30',
} as const

const biasTone = {
  long: 'text-emerald-300 bg-emerald-500/10 border-emerald-400/30',
  short: 'text-rose-300 bg-rose-500/10 border-rose-400/30',
} as const

type SignalsSectionProps = {
  user: any
}

export function SignalsSection({ user }: SignalsSectionProps) {
  const { data, loading, error } = useSignalsDashboard(user?.id)
  const [filters, setFilters] = useState({
    asset: 'all',
    timeframe: 'all',
    status: 'all' as 'all' | SignalStatus,
  })

  const signals: SignalFeedItem[] = data?.signals ?? []
  const filtered = useMemo(() => {
    return signals.filter((s) => {
      const assetOk = filters.asset === 'all' || s.asset === filters.asset
      const tfOk = filters.timeframe === 'all' || s.timeframe === filters.timeframe
      const statusOk = filters.status === 'all' || s.status === filters.status
      return assetOk && tfOk && statusOk
    })
  }, [signals, filters])

  const total = signals.length
  const active = signals.filter((s) => s.status === 'active').length
  const closed = signals.filter((s) => s.status === 'closed').length
  const avgRr =
    signals.length > 0
      ? (signals.reduce((sum, s) => sum + s.rr, 0) / signals.length).toFixed(2)
      : '—'

  const assets = ['all', ...Array.from(new Set(signals.map((s) => s.asset)))]
  const timeframes = ['all', ...Array.from(new Set(signals.map((s) => s.timeframe)))]

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-10 bg-white/5 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-white/5 border border-white/10 rounded-xl" />
          ))}
        </div>
        <div className="h-32 bg-white/5 border border-white/10 rounded-xl" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-white">Trading Signals</h1>
        <Card className="bg-white/5 border border-white/10 p-6">
          <p className="text-gray-400">Unable to load signals. Please try again later.</p>
          <p className="text-sm text-rose-300/80 mt-2">{error}</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-400 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-gold-300" />
            Member Signals
          </p>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            Trading Signals
            <Target className="h-7 w-7 text-gold-300" />
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            High-conviction setups with risk-managed entries. Educational only—trade at your own risk.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="border-gray-700 text-gray-200">
            <Filter className="h-4 w-4 mr-2" />
            Refine
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Signals', value: total, icon: TrendingUp },
          { label: 'Active', value: active, icon: Activity },
          { label: 'Closed', value: closed, icon: CheckCircle2 },
          { label: 'Avg RR', value: avgRr, icon: Target },
        ].map((stat, idx) => (
          <Card key={idx} className="bg-white/5 border border-white/10">
            <CardHeader className="flex items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">{stat.label}</CardTitle>
              <stat.icon className="h-4 w-4 text-gold-300" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/5 border border-white/10 rounded-xl p-4 flex flex-wrap gap-3 items-center">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Filter className="h-4 w-4 text-gold-300" />
          Filters:
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            className="bg-black border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
            value={filters.asset}
            onChange={(e) => setFilters((f) => ({ ...f, asset: e.target.value }))}
          >
            {assets.map((a) => (
              <option key={a} value={a}>
                {a === 'all' ? 'All assets' : a}
              </option>
            ))}
          </select>
          <select
            className="bg-black border border-white/15 rounded-lg px-3 py-2 text-sm text-white"
            value={filters.timeframe}
            onChange={(e) => setFilters((f) => ({ ...f, timeframe: e.target.value }))}
          >
            {timeframes.map((tf) => (
              <option key={tf} value={tf}>
                {tf === 'all' ? 'All timeframes' : tf}
              </option>
            ))}
          </select>
          {(['all', 'new', 'active', 'closed'] as const).map((status) => (
            <Button
              key={status}
              variant={filters.status === status ? 'default' : 'outline'}
              className={filters.status === status ? 'bg-gold-500 text-black border-gold-400' : 'border-white/20 text-gray-200'}
              onClick={() => setFilters((f) => ({ ...f, status }))}
            >
              {status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Performance */}
      <SignalsPerformance data={data?.performance} />

      {/* Equity curve */}
      <SignalsEquityCurve data={data?.equityCurve} />

      {/* Supporting analytics */}
      <SignalsAnalyticsCards data={data?.analytics} />

      {/* Feed */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map((signal) => {
          const dirTone = biasTone[signal.bias]
          const statTone = statusTone[signal.status]

          return (
            <Card key={signal.id} className="bg-white/5 border border-white/10">
              <CardHeader className="flex items-start justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    {signal.asset} • {signal.timeframe}
                    <Badge variant="outline" className={`border ${dirTone}`}>
                      {signal.bias === 'long' ? 'Long' : 'Short'}
                    </Badge>
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm mt-1">
                    RR {signal.rr.toFixed(2)} • {new Date(signal.timestamp).toLocaleString()}
                  </CardDescription>
                </div>
                <Badge className={statTone}>{signal.status === 'new' ? 'New' : signal.status === 'active' ? 'Active' : 'Closed'}</Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm text-gray-200">
                  <div>
                    <p className="text-xs text-gray-400">Entry</p>
                    <p className="font-semibold text-white">{signal.entry}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Stop Loss</p>
                    <p className="font-semibold text-rose-200">{signal.stop}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Take Profit</p>
                    <p className="font-semibold text-emerald-200">{signal.takeProfit}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">RR</p>
                    <p className="font-semibold text-gold-200">{signal.rr.toFixed(2)}</p>
                  </div>
                </div>

                <div className="text-sm text-gray-200 leading-relaxed">{signal.rationale}</div>
              </CardContent>
            </Card>
          )
        })}

        {filtered.length === 0 && (
          <Card className="bg-white/5 border border-white/10">
            <CardContent className="py-10 text-center text-gray-400">No signals found for this filter.</CardContent>
          </Card>
        )}
      </div>

      {/* History */}
      <SignalsHistory data={data?.history} />
    </div>
  )
}

