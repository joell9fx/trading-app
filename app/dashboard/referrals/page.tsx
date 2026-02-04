import { Suspense } from 'react'
import { ReferralCenter } from '@/components/dashboard/referral-center'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function DashboardReferralsPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <ReferralCenter />
      </Suspense>
    </div>
  )
}

