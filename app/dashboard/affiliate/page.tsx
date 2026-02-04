import { Suspense } from 'react'
import { AffiliateDashboard } from '@/components/dashboard/affiliate/affiliate-dashboard'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardAffiliatePage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <AffiliateDashboard />
      </Suspense>
    </div>
  )
}

