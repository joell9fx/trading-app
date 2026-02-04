import { Suspense } from 'react'
import { WalletView } from '@/components/dashboard/wallet-view'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <Suspense fallback={<LoadingSpinner />}>
        <WalletView />
      </Suspense>
    </div>
  )
}

