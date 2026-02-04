'use client'

import { Hero } from '@/components/home/hero'
import { Features } from '@/components/home/features'
import { Pricing } from '@/components/home/pricing'
import { Testimonials } from '@/components/home/testimonials'
import { CTA } from '@/components/home/cta'
import { Preview } from '@/components/home/preview'

export default function PreviewPage() {
  return (
    <>
      <Hero />
      <Features />
      <Preview />
      <Testimonials />
      <Pricing />
      <CTA />
    </>
  )
}
