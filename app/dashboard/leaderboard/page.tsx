import { Suspense } from 'react'
import { LeaderboardView } from '@/components/dashboard/leaderboard-view'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-page text-foreground p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <LeaderboardView />
      </Suspense>
    </div>
  )
}

