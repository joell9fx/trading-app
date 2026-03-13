'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Lock, Sparkles, Crown, Star } from 'lucide-react'
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
              Unlock premium products
            </p>
            <h1 className="text-3xl font-bold mt-2">Upgrade for premium market intelligence</h1>
            <p className="text-gray-300 mt-3 max-w-2xl">
              Your access unlocks immediately after checkout. You’ll be redirected back to the dashboard with your new products unlocked.
            </p>
          </div>
          <Sparkles className="h-10 w-10 text-gold-300" />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {[
          {
            id: 'signals',
            title: 'Trading Signals',
            badgeIcon: null,
            bullets: ['Daily setups with SL/TP', 'Mobile/email alerts', 'Analyst commentary'],
          },
          {
            id: 'gold_to_glory',
            title: 'Gold to Glory',
            badgeIcon: null,
            bullets: ['100 → 1000 XAUUSD challenge', 'Full trade breakdowns', 'Timeline updates'],
          },
          {
            id: 'elite_membership',
            title: 'Elite Membership',
            badgeIcon: <Crown className="h-5 w-5 text-gold-300" />,
            bullets: ['Premium perks and priority', 'Exclusive drops', 'Faster support'],
          },
          {
            id: 'vip_membership',
            title: 'VIP Membership',
            badgeIcon: <Star className="h-5 w-5 text-gold-200" />,
            bullets: ['Top-tier concierge', 'Early access & invites', 'White-glove support'],
          },
        ].map((p) => (
          <Card key={p.id} className="bg-gray-950 border border-gray-800">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-2">
                  {p.badgeIcon}
                  {p.title}
                </span>
                <span className="text-2xl font-bold text-gold-400">Premium</span>
              </CardTitle>
              <CardDescription className="text-gray-400">Unlock instantly after checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {p.bullets.map((item) => (
                <div key={item} className="flex items-center gap-2 text-gray-200">
                  <CheckCircle2 className="h-4 w-4 text-gold-400" />
                  <span className="text-sm">{item}</span>
                </div>
              ))}
              <Button
                className="w-full bg-gold-500 text-black font-semibold hover:bg-gold-600"
                onClick={() => handleCheckout(p.id)}
                disabled={loadingKey === p.id}
              >
                {loadingKey === p.id ? 'Starting checkout...' : 'Unlock Access'}
              </Button>
              <p className="text-xs text-gray-500">
                Payments processed securely. You will be redirected back to the dashboard with this product unlocked.
              </p>
            </CardContent>
          </Card>
        ))}

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
