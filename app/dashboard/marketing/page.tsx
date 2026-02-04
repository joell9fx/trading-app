import { Suspense } from 'react'
import { MarketingToolkit } from '@/components/dashboard/marketing/marketing-toolkit'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function MarketingPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <MarketingToolkit />
      </Suspense>
    </div>
  )
}

