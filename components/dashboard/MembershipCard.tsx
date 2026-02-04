'use client'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { MembershipTier } from '@/lib/tier-utils'

interface MembershipCardProps {
  tier: MembershipTier
}

export function MembershipCard({ tier }: MembershipCardProps) {
  const copy =
    tier === 'Standard'
      ? 'Unlock more to reach Premium level and get exclusive benefits.'
      : tier === 'Premium'
      ? 'You’re a Premium Member! Enjoy discounts and faster support.'
      : 'Welcome to the Elite Circle — full access, exclusive privileges, and VIP chat.'

  return (
    <Card className="p-6 bg-gradient-to-r from-black via-neutral-900 to-black border border-gold-500/50 rounded-2xl text-center shadow-[0_0_25px_rgba(255,215,0,0.08)]">
      <h2 className="text-2xl font-bold text-gold-400">{tier} Member</h2>
      <p className="text-gray-400 mt-2">{copy}</p>
      <div className="mt-4 flex justify-center">
        {tier === 'Standard' && <Badge className="bg-gray-700 text-white">Standard</Badge>}
        {tier === 'Premium' && <Badge className="bg-yellow-400 text-black">Premium</Badge>}
        {tier === 'Elite' && <Badge className="bg-blue-500 text-white">Elite</Badge>}
      </div>
    </Card>
  )
}

