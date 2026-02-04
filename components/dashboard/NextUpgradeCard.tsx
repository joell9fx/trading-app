'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ServiceKey } from '@/lib/services-list'

interface NextUpgradeCardProps {
  nextService: {
    key: ServiceKey
    name: string
    description: string
  } | null
  onCheckout: (serviceKey: ServiceKey) => void
}

export function NextUpgradeCard({ nextService, onCheckout }: NextUpgradeCardProps) {
  if (!nextService) return null

  return (
    <Card className="bg-gray-900 border border-gold-500/40 rounded-2xl p-5 text-center shadow-[0_0_20px_rgba(255,215,0,0.05)]">
      <h3 className="text-white text-lg font-semibold mb-2">Next Upgrade: {nextService.name}</h3>
      <p className="text-gray-400 text-sm mb-4">{nextService.description}</p>
      <Button
        className="bg-gold-500 text-black font-semibold hover:bg-gold-600"
        onClick={() => onCheckout(nextService.key)}
      >
        Unlock {nextService.name}
      </Button>
    </Card>
  )
}

