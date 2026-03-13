'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Lock, ArrowUpRight } from 'lucide-react'
import { ServiceKey } from '@/lib/services-list'

interface ServicesGridProps {
  services: { key: ServiceKey; name: string; description: string }[]
  unlocked: Record<string, boolean>
  onCheckout: (key: ServiceKey) => void
}

const ICONS: Record<ServiceKey, string> = {
  community: '💬',
  signals: '📈',
  funding: '💼',
  courses: '🎓',
  mentorship: '🧠',
  gold_to_glory: '🥇',
  elite_membership: '👑',
  vip_membership: '🌟',
}

const PATHS: Record<ServiceKey, string> = {
  community: '/dashboard?section=community-hub',
  signals: '/dashboard?section=signals',
  funding: '/dashboard?section=funding',
  courses: '/dashboard?section=courses',
  mentorship: '/dashboard?section=mentorship',
  gold_to_glory: '/dashboard?section=gold-to-glory',
  elite_membership: '/dashboard?section=elite-membership',
  vip_membership: '/dashboard?section=vip-membership',
}

const PAID_SERVICES = new Set<ServiceKey>([
  'signals',
  'gold_to_glory',
  'elite_membership',
  'vip_membership',
])
const INCLUDED_SERVICES = new Set<ServiceKey>(['community', 'funding', 'courses', 'mentorship'])
const COMING_SOON_SERVICES = new Set<ServiceKey>(['auto_trader' as ServiceKey])

export function ServicesGrid({ services, unlocked, onCheckout }: ServicesGridProps) {
  const [availability, setAvailability] = useState<Record<string, boolean>>({})
  const [loading, setLoading] = useState(true)
  const serviceList = Array.isArray(services) ? services : []

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const res = await fetch('/api/products/availability', { cache: 'no-store' })
        if (!res.ok) throw new Error('Failed availability fetch')
        const json = await res.json()
        if (mounted) {
          setAvailability(json?.availability || {})
        }
      } catch {
        if (mounted) {
          const fallback: Record<string, boolean> = {}
          PAID_SERVICES.forEach((k) => (fallback[k] = false))
          setAvailability(fallback)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {serviceList.map((service) => {
        const isUnlocked = !!unlocked[service.key]
        const isCommunity = service.key === 'community'
        const isPaid = PAID_SERVICES.has(service.key)
        const isIncluded = INCLUDED_SERVICES.has(service.key)
        const isComingSoon = COMING_SOON_SERVICES.has(service.key)
        const isAvailable = availability[service.key]
        const isChecking = isPaid && loading

        return (
          <div
            key={service.key}
            className={`relative overflow-hidden border rounded-2xl p-5 transition-all group ${
              isUnlocked ? 'border-green-500/40 bg-green-500/5' : 'border-gray-800 bg-gray-950'
            } ${isCommunity ? 'hover:border-gold-500/70 hover:shadow-[0_0_25px_rgba(255,215,0,0.18)]' : 'hover:border-gold-500/50'}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${isUnlocked ? 'border-green-400/50 bg-green-500/10' : 'border-gray-700 bg-gray-900/70'}`}>
                  <span className="text-xl">{ICONS[service.key]}</span>
                </div>
                <div>
                  <h4 className="text-lg text-white font-semibold flex items-center gap-2">
                    {service.name}
                  </h4>
                  <p className="text-xs uppercase tracking-wide text-gray-500">
                    {isUnlocked ? 'Unlocked' : 'Locked'}
                  </p>
                </div>
              </div>
              {!isUnlocked && <Lock className="h-4 w-4 text-gold-400" aria-label="Locked" />}
            </div>
            <p className="text-gray-300 text-sm mt-3 mb-6">{service.description}</p>
            {isComingSoon ? (
              <div className="inline-flex items-center justify-center rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">
                Coming Soon
              </div>
            ) : isIncluded || isUnlocked ? (
              <Link
                href={PATHS[service.key]}
                className="inline-flex items-center justify-center rounded-md bg-gold-500 text-black px-4 py-2 font-semibold hover:bg-gold-600 transition"
              >
                Enter
                <ArrowUpRight className="h-4 w-4 ml-2" />
              </Link>
            ) : isPaid ? (
              isAvailable ? (
                <Button
                  onClick={() => onCheckout(service.key)}
                  className="bg-gold-500 text-black font-semibold hover:bg-gold-600"
                  title="Unlock this feature to gain full access."
                >
                  Unlock Access
                </Button>
              ) : (
                <div className="inline-flex items-center justify-center rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">
                  {isChecking ? 'Checking...' : 'Coming Soon'}
                </div>
              )
            ) : (
              <div className="inline-flex items-center justify-center rounded-md border border-white/20 px-4 py-2 text-sm text-gray-300">
                Unavailable
              </div>
            )}

            {!isUnlocked && (
              <div className="absolute inset-0 bg-black/65 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 rounded-2xl border border-gold-500/40 shadow-[0_0_25px_rgba(255,215,0,0.12)]">
                <div className="flex items-center gap-2 text-gold-300 text-sm">
                  <Lock className="h-4 w-4" aria-label="Locked" />
                  <span>Locked Feature</span>
                </div>
                <p className="text-xs text-gray-300 px-4 text-center">
                  {isComingSoon
                    ? 'Coming soon.'
                    : isPaid
                      ? isAvailable
                        ? 'Unlock this feature to gain full access.'
                        : isChecking
                          ? 'Checking availability...'
                          : 'Coming soon.'
                      : 'Included for members.'}
                </p>
                {isPaid && !isComingSoon && isAvailable && (
                  <Button
                    onClick={() => onCheckout(service.key)}
                    className="bg-gold-500 text-black font-semibold hover:bg-gold-600"
                    title="Unlock this feature to gain full access."
                  >
                    Unlock Access
                  </Button>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

