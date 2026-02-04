import { LeaderboardClient } from '@/components/leaderboard/leaderboard-client'
import { Suspense } from 'react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 space-y-4">
      <Suspense fallback={<LoadingSpinner />}>
        <LeaderboardClient />
      </Suspense>
    </div>
  )
}

