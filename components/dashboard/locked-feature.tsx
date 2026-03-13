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
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface/90 p-8 text-center">
      <div className="absolute inset-0 bg-gradient-to-br from-panel/80 to-page/80 backdrop-blur" />
      <div className="relative space-y-4">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/20 border border-primary/30">
          <Lock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm uppercase tracking-wide text-muted-foreground">Locked: {serviceKey}</p>
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {description || 'Unlock this feature to gain full access.'}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            onClick={onCheckout || onUnlock}
          >
            Unlock Now
          </Button>
          {ctaHref && (
            <Button
              variant="outline"
              className="border-border text-foreground/90 hover:border-primary/60 hover:text-primary"
              asChild
            >
              <a href={ctaHref}>View Pricing</a>
            </Button>
          )}
        </div>
        <p className="text-xs text-muted-foreground">Unlock to access this module without leaving your dashboard.</p>
      </div>
    </div>
  )
}

