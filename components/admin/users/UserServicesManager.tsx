'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { ACCESS_DEFAULTS } from '@/lib/access-flags'

type ServiceKey = 'community' | 'signals' | 'courses' | 'mentorship' | 'funding'

const SERVICE_LABELS: Record<ServiceKey, string> = {
  community: 'Community Hub',
  signals: 'Signals',
  courses: 'Courses',
  mentorship: 'Mentorship',
  funding: 'Funding Portal',
}

interface UserServicesManagerProps {
  userId: string
  userEmail?: string | null
}

export function UserServicesManager({ userId, userEmail }: UserServicesManagerProps) {
  const [services, setServices] = useState<Record<ServiceKey, boolean>>({
    ...ACCESS_DEFAULTS,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [tier, setTier] = useState('Standard')
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/services`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load services')
      if (json.access) {
        setServices({ ...ACCESS_DEFAULTS, ...json.access })
      } else if (json.services) {
        const next = { ...ACCESS_DEFAULTS }
        json.services?.forEach((row: any) => {
          if (row.service_key in next) {
            next[row.service_key as ServiceKey] = !!row.is_unlocked
          }
        })
        setServices(next)
      }

      const profileRes = await fetch(`/api/admin/users/${userId}/tier`, { method: 'POST' })
      const profileJson = await profileRes.json()
      if (profileRes.ok && profileJson?.tier) {
        setTier(profileJson.tier)
      }
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to load services', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  const toggleService = async (service_key: ServiceKey, nextValue: boolean) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/services`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ service_key, is_unlocked: nextValue }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update service')
      if (json.access) {
        setServices({ ...ACCESS_DEFAULTS, ...json.access })
      } else {
        setServices((prev) => ({ ...prev, [service_key]: nextValue }))
      }
      const tierRes = await fetch(`/api/admin/users/${userId}/tier`, { method: 'POST' })
      const tierJson = await tierRes.json()
      if (tierRes.ok && tierJson?.tier) {
        setTier(tierJson.tier)
      }
      toast({ title: `${SERVICE_LABELS[service_key]} ${nextValue ? 'unlocked' : 'locked'}` })
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to update service', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  const setManualTier = async (newTier: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/users/${userId}/tier`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: newTier }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to set tier')
      setTier(newTier)
      toast({ title: `Tier set to ${newTier}` })
    } catch (error: any) {
      toast({ title: 'Error', description: error?.message || 'Failed to set tier', variant: 'destructive' })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="bg-gray-900 border border-gray-800">
      <CardHeader>
        <CardTitle className="text-white">Manage Services</CardTitle>
        <p className="text-sm text-gray-400">{userEmail || userId}</p>
        <div className="text-sm text-gray-200 mt-2">
          Current Tier: <span className="font-semibold">{tier}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p className="text-gray-300">Loading services...</p>
        ) : (
          Object.entries(SERVICE_LABELS).map(([key, label]) => {
            const isCommunity = key === 'community'
            return (
              <div key={key} className="flex items-center justify-between rounded-lg border border-gray-800 bg-gray-950 px-4 py-3">
                <div>
                  <p className="text-white font-medium">{label}</p>
                  <p className="text-xs text-gray-500">
                    {isCommunity ? 'Community is always available.' : 'Toggle access for this service.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Label className="text-gray-300">{services[key as ServiceKey] ? 'Unlocked' : 'Locked'}</Label>
                  <Switch
                    checked={services[key as ServiceKey]}
                    onCheckedChange={(v) => toggleService(key as ServiceKey, v)}
                    disabled={saving || isCommunity}
                  />
                </div>
              </div>
            )
          })
        )}
        <div className="flex items-center gap-2 text-sm text-gray-400">
          <Button variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300" onClick={load} disabled={loading}>
            Refresh
          </Button>
          <Button variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60 hover:text-gold-300" onClick={() => setManualTier('Standard')} disabled={saving}>Set Standard</Button>
          <Button variant="outline" className="border-yellow-500/50 text-yellow-200 hover:border-yellow-500/60 hover:text-yellow-100" onClick={() => setManualTier('Premium')} disabled={saving}>Set Premium</Button>
          <Button variant="outline" className="border-blue-500/50 text-blue-200 hover:border-blue-500/60 hover:text-blue-100" onClick={() => setManualTier('Elite')} disabled={saving}>Set Elite</Button>
          {saving && <span className="text-xs text-gray-500">Saving...</span>}
        </div>
      </CardContent>
    </Card>
  )
}

