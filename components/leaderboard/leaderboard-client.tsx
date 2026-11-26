'use client'

import { useCallback, useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadError } from '@/components/ui/load-error'

interface Entry {
  username: string
  avatar_url?: string | null
  xp: number
  metric_value: number
}

export function LeaderboardClient() {
  const [metric, setMetric] = useState<'xp' | 'consistency' | 'lessons' | 'referrals'>('xp')
  const [entries, setEntries] = useState<Entry[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)

  const load = useCallback(async (m: string, signal?: AbortSignal) => {
    setLoading(true)
    setFailed(false)
    try {
      const res = await fetch(`/api/leaderboard?metric=${m}`, { signal })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || `Request failed (${res.status})`)
      setEntries(json.entries || [])
    } catch (err) {
      if ((err as Error)?.name === 'AbortError') return
      setEntries([])
      setFailed(true)
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    // Abort the previous request so a slow response can't overwrite a newer metric.
    const controller = new AbortController()
    load(metric, controller.signal)
    return () => controller.abort()
  }, [metric, load])

  return (
    <Card className="bg-black border border-gold-500/40 p-6 rounded-2xl space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-gold-400 font-bold">
          <span aria-hidden="true">🏆 </span>Trading Academy Leaderboard
        </h1>
        <div className="flex gap-2 text-sm">
          {(['xp', 'consistency', 'lessons', 'referrals'] as const).map((m) => (
            <Button
              key={m}
              onClick={() => setMetric(m)}
              className={metric === m ? 'bg-gold-500 text-black' : 'bg-neutral-900 text-gray-300 border border-gray-800'}
              size="sm"
            >
              {m === 'xp' ? 'XP Rank' : m === 'consistency' ? 'Consistency' : m === 'lessons' ? 'Lessons' : 'Top Referrers'}
            </Button>
          ))}
        </div>
      </div>

      {loading && <p className="text-gray-400">Loading...</p>}
      {!loading && failed && <LoadError what="the leaderboard" onRetry={() => load(metric)} />}
      {!loading && !failed && entries.length === 0 && (
        <p className="text-gray-400">No rankings yet. Earn XP by completing lessons and challenges to appear here.</p>
      )}

      <div className="space-y-3">
        {entries.map((u, i) => (
          <div key={`${u.username}-${i}`} className="flex items-center justify-between bg-neutral-900 border border-gray-800 p-3 rounded-xl">
            <div className="flex items-center gap-3">
              <span className="text-gold-400 font-bold w-6">{i + 1}</span>
              {u.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- user-uploaded or generated image from an arbitrary host; next/image needs allow-listed domains
                <img src={u.avatar_url} alt={`${u.username} avatar`} className="w-10 h-10 rounded-full border border-gold-500 object-cover" />
              ) : (
                <div className="w-10 h-10 rounded-full border border-gold-500 bg-gray-800" />
              )}
              <a href={`/u/${u.username}`} className="text-white font-semibold hover:text-gold-400">
                @{u.username}
              </a>
            </div>
            <p className="text-gray-300 text-sm">
              {metric === 'xp'
                ? `${u.xp} XP`
                : metric === 'consistency'
                  ? `${u.metric_value}`
                  : metric === 'lessons'
                    ? `${u.metric_value} lessons`
                    : `${u.metric_value} referrals`}
            </p>
          </div>
        ))}
      </div>
    </Card>
  )
}

