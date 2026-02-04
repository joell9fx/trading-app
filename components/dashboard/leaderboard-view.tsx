'use client'

import { useEffect, useState } from 'react'
import { useLeaderboard } from './use-leaderboard'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createSupabaseClient } from '@/lib/supabase/client'

export function LeaderboardView() {
  const { users, loading } = useLeaderboard(50)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      const supabase = createSupabaseClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUserId(user?.id || null)
    }
    load()
  }, [])

  return (
    <div className="space-y-6">
      <Card className="bg-black border border-gold-500/50 p-6 text-center rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.08)]">
        <h2 className="text-2xl text-gold-400 font-bold">🏆 Leaderboard</h2>
        <p className="text-gray-400 mt-1">Compete with traders, referrers, and top community members.</p>
      </Card>

      <Card className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-800">
            <thead className="bg-gray-900/70">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Rank</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">User</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">XP</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Tier</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-400">Badges</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 bg-gray-950/40">
              {loading && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-400" colSpan={5}>
                    Loading leaderboard...
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((u) => (
                  <tr
                    key={u.id}
                    className={`${u.id === currentUserId ? 'bg-gold-500/10' : ''}`}
                  >
                    <td className="px-4 py-3 text-sm text-white font-semibold">#{u.rank_position || '–'}</td>
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {u.name || u.email || u.id}
                    </td>
                    <td className="px-4 py-3 text-sm text-white">{u.xp}</td>
                    <td className="px-4 py-3 text-sm text-gray-200">{u.membership_tier || 'Standard'}</td>
                    <td className="px-4 py-3 text-sm text-gray-200">
                      {(u.badges || []).length === 0 && <span className="text-gray-500 text-xs">—</span>}
                      {(u.badges || []).map((b) => (
                        <Badge key={b} className="bg-gold-500/20 text-gold-200 border border-gold-500/40 mr-1">
                          {b}
                        </Badge>
                      ))}
                    </td>
                  </tr>
                ))}
              {!loading && users.length === 0 && (
                <tr>
                  <td className="px-4 py-3 text-sm text-gray-400" colSpan={5}>
                    No leaderboard data yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}

