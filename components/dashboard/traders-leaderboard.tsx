'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface TraderRow {
  user_id: string
  win_rate: number
  consistency_score: number
  total_trades: number
  avg_rr: number
  total_profit: number
  profiles?: {
    id: string
    name?: string | null
    full_name?: string | null
    email?: string | null
    membership_tier?: string | null
    xp?: number | null
    badges?: string[] | null
  }
}

export function TradersLeaderboard() {
  const [rows, setRows] = useState<TraderRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const res = await fetch('/api/traders/leaderboard')
      const json = await res.json()
      if (res.ok) {
        setRows(json.traders || [])
      }
      setLoading(false)
    }
    load()
  }, [])

  return (
    <Card className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
      <h2 className="text-white text-lg font-semibold mb-3">Performance Leaderboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-800">
          <thead className="bg-gray-900/70">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Rank</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Trader</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Win Rate</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Consistency</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">XP</th>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-400">Badges</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800 bg-gray-950/40">
            {loading && (
              <tr>
                <td className="px-3 py-2 text-sm text-gray-400" colSpan={6}>
                  Loading...
                </td>
              </tr>
            )}
            {!loading &&
              rows.map((t, i) => (
                <tr key={t.user_id}>
                  <td className="px-3 py-2 text-sm text-white font-semibold">#{i + 1}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">
                    {t.profiles?.name || t.profiles?.full_name || t.profiles?.email || t.user_id}
                  </td>
                  <td className="px-3 py-2 text-sm text-white">{Math.round(t.win_rate || 0)}%</td>
                  <td className="px-3 py-2 text-sm text-white">{Math.round(t.consistency_score || 0)}</td>
                  <td className="px-3 py-2 text-sm text-white">{t.profiles?.xp || 0}</td>
                  <td className="px-3 py-2 text-sm text-gray-200">
                    {(t.profiles?.badges || []).map((b) => (
                      <Badge key={b} className="bg-gold-500/20 text-gold-200 border border-gold-500/40 mr-1">
                        {b}
                      </Badge>
                    ))}
                  </td>
                </tr>
              ))}
            {!loading && rows.length === 0 && (
              <tr>
                <td className="px-3 py-2 text-sm text-gray-400" colSpan={6}>
                  No traders yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}

