import { Suspense } from 'react'
import { TradersLeaderboard } from '@/components/dashboard/traders-leaderboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function TradersPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6 space-y-4">
      <h1 className="text-3xl font-bold">Performance Leaderboard</h1>
      <p className="text-gray-400">See the most consistent and high-performing traders.</p>
      <Suspense fallback={<LoadingSpinner />}>
        <TradersLeaderboard />
      </Suspense>
    </div>
  )
}

