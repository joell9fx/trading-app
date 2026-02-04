'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { useSearchParams } from 'next/navigation'

interface UpgradePlansProps {
  userId: string
  hasSignals: boolean
  hasMentorship: boolean
  hasAiTools: boolean
}

export function UpgradePlans({ userId, hasSignals, hasMentorship, hasAiTools }: UpgradePlansProps) {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [loadingProduct, setLoadingProduct] = useState<string | null>(null)

  useEffect(() => {
    const success = searchParams.get('success')
    const cancelled = searchParams.get('cancelled')
    if (success) {
      toast({ title: 'Unlocked', description: `You have unlocked ${success}.` })
    } else if (cancelled) {
      toast({ title: 'Payment cancelled', description: 'No charge was made.', variant: 'destructive' })
    }
  }, [searchParams, toast])

  const plans = [
    {
      id: 'signals',
      name: 'Trading Signals',
      desc: 'Real-time trade alerts and setups from our experts.',
      price: '£19 / month',
      active: hasSignals,
    },
    {
      id: 'mentorship',
      name: 'Mentorship Tiers',
      desc: 'Structured mentorship with live calls and strategy breakdowns.',
      price: '£99 one-time',
      active: hasMentorship,
    },
    {
      id: 'ai_tools',
      name: 'AI Tools Access',
      desc: 'Unlock AI-powered analysis and trade journal tools.',
      price: '£29 / month',
      active: hasAiTools,
    },
  ]

  const startCheckout = async (product: string) => {
    setLoadingProduct(product)
    try {
      const res = await fetch('/api/checkout/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, product }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        throw new Error(json.error || 'Unable to start checkout')
      }
      window.location.href = json.url
    } catch (err: any) {
      toast({ title: 'Error', description: err.message || 'Checkout failed', variant: 'destructive' })
      setLoadingProduct(null)
    }
  }

  return (
    <div className="bg-black text-white p-6 md:p-8 border border-gold-500/50 rounded-2xl max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl text-gold-400 font-bold mb-2">💳 Upgrade Your Access</h1>
        <p className="text-gray-400 text-sm">Unlock premium features to take your trading to the next level.</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {plans.map((p) => (
          <Card
            key={p.id}
            className={`p-6 rounded-xl border ${
              p.active ? 'border-green-500/60' : 'border-gold-500/60'
            } bg-neutral-950`}
          >
            <h2 className="text-xl text-gold-300 font-semibold mb-2">{p.name}</h2>
            <p className="text-sm text-gray-300 mb-4">{p.desc}</p>
            <p className="text-lg font-bold mb-4">{p.price}</p>
            <p className="text-xs text-gray-500 mb-2">Access activates instantly after payment.</p>
            {p.active ? (
              <p className="text-green-400 font-semibold">✅ Unlocked</p>
            ) : (
              <Button
                onClick={() => startCheckout(p.id)}
                disabled={!!loadingProduct}
                className="bg-gold-500 text-black font-semibold hover:bg-gold-600"
              >
                {loadingProduct === p.id ? 'Processing...' : 'Unlock Now'}
              </Button>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}

