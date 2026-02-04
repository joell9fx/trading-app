'use client'

import { Card } from '@/components/ui/card'

interface DashboardProgressCardProps {
  unlockedCount: number
  totalCount: number
}

export function DashboardProgressCard({ unlockedCount, totalCount }: DashboardProgressCardProps) {
  const progress = Math.round((unlockedCount / Math.max(totalCount, 1)) * 100)

  return (
    <Card className="bg-black border border-gold-500/40 rounded-2xl p-6 text-center shadow-[0_0_30px_rgba(255,215,0,0.08)]">
      <h2 className="text-xl font-semibold text-white mb-2">
        Progress: {unlockedCount} of {totalCount} Unlocked
      </h2>
      <div className="w-full bg-gray-800 h-3 rounded-full overflow-hidden">
        <div className="h-3 bg-gold-500 transition-all" style={{ width: `${progress}%` }}></div>
      </div>
      <p className="text-gray-400 mt-3 text-sm">
        {progress < 100
          ? 'Unlock all features to access the full potential of your trading suite.'
          : '🎉 You’ve unlocked everything — full access granted!'}
      </p>
    </Card>
  )
}

