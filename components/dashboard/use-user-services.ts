'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { createSupabaseClient } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  ACCESS_DEFAULTS,
  AccessModuleKey,
  deriveAccessFromProfile,
  countUnlocked as countUnlockedAccess,
} from '@/lib/access-flags'

export type ServiceKey = AccessModuleKey

export function useUserServices(userId?: string) {
  const supabase = createSupabaseClient()
  const { toast } = useToast()
  const [services, setServices] = useState<Record<ServiceKey, boolean>>({ ...ACCESS_DEFAULTS })
  const [loading, setLoading] = useState(false)

  const fetchServices = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const [profileResult, servicesResult] = await Promise.all([
        supabase
          .from('profiles')
          .select('has_signals_access, has_funding_access, has_courses_access, has_mentorship_access, has_ai_tools_access')
          .eq('id', userId)
          .single(),
        supabase
          .from('user_services')
          .select('service_key, is_unlocked')
          .eq('user_id', userId)
          .eq('is_unlocked', true),
      ])

      if (profileResult.error) throw profileResult.error

      const baseAccess = deriveAccessFromProfile(profileResult.data || {})
      const unlocked: Record<ServiceKey, boolean> = { ...baseAccess }

      // If user_services table doesn't exist yet (e.g., missing migration), skip gracefully.
      if (servicesResult.error?.code === 'PGRST205') {
        console.warn('user_services table missing; using base profile access only')
      } else if (servicesResult.error) {
        throw servicesResult.error
      } else {
        servicesResult.data?.forEach((row) => {
          const key = row.service_key as ServiceKey
          if (typeof row.is_unlocked === 'boolean') {
            unlocked[key] = unlocked[key] || !!row.is_unlocked
          }
        })
      }

      setServices(unlocked)
    } catch (error) {
      console.error('Error loading user services:', error)
      toast({
        title: 'Error',
        description: 'Could not load your services',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }, [supabase, toast, userId])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  const unlockService = useCallback(
    async (service_key: ServiceKey) => {
      const response = await fetch('/api/services/unlock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_key }),
      })
      const result = await response.json()
      if (!response.ok) {
        throw new Error(result?.error || 'Failed to unlock service')
      }
      await fetchServices()
      return result
    },
    [fetchServices]
  )

  const isUnlocked = useCallback(
    (service_key: ServiceKey) => !!services[service_key],
    [services]
  )

  const unlockedCount = useMemo(() => countUnlockedAccess(services), [services])

  return {
    services,
    loading,
    isUnlocked,
    unlockService,
    refresh: fetchServices,
    unlockedCount,
  }
}
