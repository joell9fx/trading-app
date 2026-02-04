'use client'

import { loadStripe } from '@stripe/stripe-js'
import { useToast } from '@/hooks/use-toast'
import { useState } from 'react'

const stripePromise = typeof window !== 'undefined' && process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY)
  : null

export function useCheckout() {
  const { toast } = useToast()
  const [loadingKey, setLoadingKey] = useState<string | null>(null)

  const handleCheckout = async (serviceKey: string) => {
    try {
      setLoadingKey(serviceKey)
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ serviceKey }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Checkout failed')

      if (!stripePromise) throw new Error('Stripe is not configured')
      const stripe = await stripePromise
      if (!stripe) throw new Error('Stripe failed to initialize')

      const result = await stripe.redirectToCheckout({ sessionId: data.sessionId })
      if (result.error) {
        throw new Error(result.error.message)
      }
    } catch (error: any) {
      toast({
        title: 'Checkout error',
        description: error?.message || 'Unable to start checkout',
        variant: 'destructive',
      })
    } finally {
      setLoadingKey(null)
    }
  }

  return { handleCheckout, loadingKey }
}

