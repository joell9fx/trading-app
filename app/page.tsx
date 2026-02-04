import { Suspense } from 'react'
import { Hero } from '@/components/home/hero'
import { Features } from '@/components/home/features'
import { Preview } from '@/components/home/preview'
import { Testimonials } from '@/components/home/testimonials'
import { Pricing } from '@/components/home/pricing'
import { CTA } from '@/components/home/cta'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Suspense fallback={<LoadingSpinner />}>
        <Hero />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Features />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Preview />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Testimonials />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <Pricing />
      </Suspense>
      
      <Suspense fallback={<LoadingSpinner />}>
        <CTA />
      </Suspense>
    </main>
  )
}
