'use client'

import { Button } from '@/components/ui/button'
import { Lock } from 'lucide-react'

interface LockedFeatureProps {
  serviceKey: string
  title: string
  description?: string
  onUnlock?: () => void
  onCheckout?: () => void
  ctaHref?: string
}

export function LockedFeature({ serviceKey, title, description, onUnlock, onCheckout, ctaHref }: LockedFeatureProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-gray-800 bg-gray-950/80 p-8 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900/60 to-black/60 backdrop-blur" />
      <div className="relative space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gold-500/20 border border-gold-500/30">
          <Lock className="h-6 w-6 text-gold-400" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-gray-400">Locked: {serviceKey}</p>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 text-sm text-gray-400">
            {description || 'Unlock this feature to gain full access.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            className="bg-gold-500 hover:bg-gold-600 text-black"
            onClick={onCheckout || onUnlock}
          >
            Unlock Now
          </Button>
          {ctaHref && (
            <Button
              variant="outline"
              className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300"
              asChild
            >
              <a href={ctaHref}>View Pricing</a>
            </Button>
          )}
        </div>
        <p className="text-xs text-gray-500">Unlock to access this module without leaving your dashboard.</p>
      </div>
    </div>
  )
}

