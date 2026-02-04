'use client'

import { useState } from 'react'
import { PricingHero } from './pricing-hero'
import { PricingPlans } from './pricing-plans'
import { PricingComparison } from './pricing-comparison'
import { PricingGuarantee } from './pricing-guarantee'
import { PricingTestimonials } from './pricing-testimonials'
import { PricingFAQ } from './pricing-faq'
import { PricingCTA } from './pricing-cta'

export function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')

  return (
    <div className="space-y-24">
      <PricingHero />
      
      <PricingPlans 
        billingCycle={billingCycle} 
        onBillingCycleChange={setBillingCycle} 
      />
      
      <PricingComparison billingCycle={billingCycle} />
      
      <PricingGuarantee />
      
      <PricingTestimonials />
      
      <PricingFAQ />
      
      <PricingCTA billingCycle={billingCycle} />
    </div>
  )
}
