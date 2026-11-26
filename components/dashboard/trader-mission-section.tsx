'use client'

import { useEffect, useState } from 'react'
import { useRole } from './role-provider'
import { hydrateTodayMission } from '@/lib/trader-mission/mission-service'
import { DailyTradingPlanCard } from './trader-mission/daily-trading-plan-card'
import { DisciplineTrackerCard } from './trader-mission/discipline-tracker-card'
import { TradeLimitCard } from './trader-mission/trade-limit-card'
import { PsychologyCheckCard } from './trader-mission/psychology-check-card'
import { MissionCompletionCard } from './trader-mission/mission-completion-card'
import { FlagIcon } from '@heroicons/react/24/outline'

export function TraderMissionSection() {
  const { user } = useRole()
  const userId = user?.id
  const [ready, setReady] = useState(false)

  // Load the server copy before the cards read the local cache. Don't wait
  // more than a couple of seconds: the cards work fine from the local copy.
  useEffect(() => {
    let cancelled = false
    const timeout = setTimeout(() => !cancelled && setReady(true), 2500)
    hydrateTodayMission().finally(() => {
      if (!cancelled) setReady(true)
    })
    return () => {
      cancelled = true
      clearTimeout(timeout)
    }
  }, [userId])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <FlagIcon className="h-8 w-8 text-primary" />
          Trader Mission
        </h1>
        <p className="mt-1 text-sm text-muted-foreground sm:text-base">
          Plan your trading day, follow discipline rules, and build consistent
          trading habits.
        </p>
      </div>

      {!ready ? (
        <div
          className="grid animate-pulse grid-cols-1 gap-4 lg:grid-cols-2"
          aria-busy="true"
          aria-label="Loading today's mission"
        >
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-48 rounded-xl bg-panel" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <DailyTradingPlanCard />
            <DisciplineTrackerCard />
            <TradeLimitCard userId={userId} />
            <PsychologyCheckCard />
          </div>

          <div className="max-w-2xl">
            <MissionCompletionCard userId={userId} />
          </div>
        </>
      )}
    </div>
  )
}
