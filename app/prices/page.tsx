import { Suspense } from 'react'
import { PricingPage } from '@/components/pricing/pricing-page'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export const metadata = {
  title: 'Pricing - Trading Academy',
  description: 'Choose the perfect plan for your trading journey. Start free or upgrade to Pro for advanced features and mentoring.',
}

export default function PricesPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Suspense fallback={<LoadingSpinner />}>
        <PricingPage />
      </Suspense>
    </div>
  )
}
