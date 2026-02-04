'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

type Flag = { key: string; value: boolean }

export default function SuperAdminSecurityPage() {
  const [flags, setFlags] = useState<Flag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/superadmin/system-flags')
    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Failed to load flags')
    } else {
      setFlags(json.flags || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const updateFlag = async (key: string, value: boolean) => {
    setSaving(key)
    setError(null)
    try {
      const res = await fetch('/api/superadmin/system-flags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to update flag')
      setFlags((prev) => {
        const existing = prev.find((f) => f.key === key)
        if (existing) {
          return prev.map((f) => (f.key === key ? { ...f, value } : f))
        }
        return [...prev, { key, value }]
      })
    } catch (err: any) {
      setError(err?.message || 'Failed to update flag')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-white">Security & Safety</h2>
        <p className="text-sm text-gray-400">
          Trigger lockdown mode, revoke access, and view platform safety flags.
        </p>
      </div>
      {error && <div className="text-sm text-red-400">{error}</div>}
      <div className="border border-gray-800 rounded-xl p-5 bg-neutral-950 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gold-300">Lockdown Mode</h3>
            <p className="text-sm text-gray-400">Disables payments/access while issues are investigated.</p>
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-gray-300">Lockdown</Label>
            <Switch
              checked={!!flags.find((f) => f.key === 'lockdown')?.value}
              onCheckedChange={(v) => updateFlag('lockdown', v)}
              disabled={saving === 'lockdown'}
            />
          </div>
        </div>
        <div className="border-t border-gray-800 pt-4">
          <Button variant="outline" className="border-gray-700 text-gray-200 hover:border-gold-500/60" onClick={load} disabled={loading}>
            Refresh Flags
          </Button>
        </div>
      </div>
    </div>
  )
}

