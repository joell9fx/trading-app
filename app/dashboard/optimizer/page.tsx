import { Suspense } from 'react'
import { OptimizerDashboard } from '@/components/dashboard/optimizer/optimizer-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function OptimizerPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <OptimizerDashboard />
      </Suspense>
    </div>
  )
}

