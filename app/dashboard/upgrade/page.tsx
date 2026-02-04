'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Lock, Sparkles } from 'lucide-react'
import { useCheckout } from '@/components/dashboard/use-checkout'

export default function UpgradePage() {
  const { handleCheckout, loadingKey } = useCheckout()

  return (
    <div className="max-w-5xl mx-auto p-6 text-white space-y-8">
      <div className="rounded-2xl border border-gold-500/40 bg-gradient-to-r from-gray-900 via-black to-gray-900 p-8 shadow-[0_0_30px_rgba(255,215,0,0.12)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-wide text-gold-300 flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Unlock Trading Signals
            </p>
            <h1 className="text-3xl font-bold mt-2">Upgrade for premium market intelligence</h1>
            <p className="text-gray-300 mt-3 max-w-2xl">
              Get daily setups, levels, and analyst commentary. Your access flag will be set automatically after payment and you will be redirected to the Signals dashboard.
            </p>
          </div>
          <Sparkles className="h-10 w-10 text-gold-300" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-gray-950 border border-gray-800">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Trading Signals
              <span className="text-2xl font-bold text-gold-400">£19<span className="text-sm font-semibold text-gray-400">/mo</span></span>
            </CardTitle>
            <CardDescription className="text-gray-400">Monthly access, cancel anytime.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Daily high-conviction setups',
              'Entry, SL, TP, and RR guidance',
              'Mobile and email alerts',
              'Priority analyst Q&A',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-gray-200">
                <CheckCircle2 className="h-4 w-4 text-gold-400" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
            <Button
              className="w-full bg-gold-500 text-black font-semibold hover:bg-gold-600"
              onClick={() => handleCheckout('signals')}
              disabled={loadingKey === 'signals'}
            >
              {loadingKey === 'signals' ? 'Starting checkout...' : 'Unlock Trading Signals'}
            </Button>
            <p className="text-xs text-gray-500">
              Payments processed securely. On success we set <code>has_signals_access = true</code> and route you back to Signals.
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gray-950 border border-gray-800">
          <CardHeader>
            <CardTitle>Included with your account</CardTitle>
            <CardDescription className="text-gray-400">
              These modules stay unlocked so you can keep progressing.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              'Community Hub (always open)',
              'Funding Account support',
              'Trading Courses library',
              'Mentorship discovery (tiers billed separately)',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-gray-200">
                <CheckCircle2 className="h-4 w-4 text-green-400" />
                <span className="text-sm">{item}</span>
              </div>
            ))}
            <div className="flex gap-2">
              <Link href="/dashboard" className="flex-1">
                <Button variant="outline" className="w-full border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300">
                  Back to Dashboard
                </Button>
              </Link>
              <Link href="/dashboard?section=community-hub" className="flex-1">
                <Button className="w-full bg-gold-500 text-black font-semibold hover:bg-gold-600">
                  Jump into Community
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
