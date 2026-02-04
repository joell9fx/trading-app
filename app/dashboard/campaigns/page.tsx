import { Suspense } from 'react'
import { CampaignManager } from '@/components/dashboard/campaigns/campaign-manager'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function CampaignsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <CampaignManager />
      </Suspense>
    </div>
  )
}

