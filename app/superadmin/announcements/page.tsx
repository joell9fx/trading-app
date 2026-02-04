'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

type Announcement = {
  id: string
  title: string | null
  message: string | null
  created_at: string
  expires_at: string | null
}

export default function SuperAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ title: '', message: '', expires_at: '' })
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    setError(null)
    const res = await fetch('/api/superadmin/announcement')
    const json = await res.json()
    if (!res.ok) {
      setError(json.error || 'Failed to load announcements')
    } else {
      setAnnouncements(json.announcements || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch('/api/superadmin/announcement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: form.title,
          message: form.message,
          expires_at: form.expires_at || null,
        }),
      })
      const json = await res.json()
      if (!res.ok) {
        throw new Error(json.error || 'Failed to post announcement')
      }
      setForm({ title: '', message: '', expires_at: '' })
      await load()
    } catch (err: any) {
      setError(err?.message || 'Failed to post announcement')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="border border-gold-500/40 rounded-xl p-5 bg-neutral-950 shadow-[0_0_20px_rgba(255,215,0,0.06)]">
        <h2 className="text-xl font-semibold text-gold-300 mb-3">Post Global Announcement</h2>
        <form className="space-y-3" onSubmit={submit}>
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
          <Textarea
            placeholder="Message"
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
            className="min-h-[120px]"
          />
          <Input
            type="datetime-local"
            value={form.expires_at}
            onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
          />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={saving} className="bg-gold-500 text-black hover:bg-gold-600">
              {saving ? 'Posting...' : 'Publish'}
            </Button>
            {error && <span className="text-sm text-red-400">{error}</span>}
          </div>
        </form>
      </div>

      <div className="border border-gray-800 rounded-xl p-5 bg-neutral-950">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-white">Announcements</h3>
          {loading && <span className="text-xs text-gray-500">Loading...</span>}
        </div>
        <div className="space-y-3">
          {announcements.length === 0 && !loading && (
            <p className="text-sm text-gray-500">No announcements yet.</p>
          )}
          {announcements.map((a) => (
            <div key={a.id} className="border border-gray-800 rounded-lg p-4 bg-black/50">
              <div className="flex items-center justify-between">
                <h4 className="text-white font-semibold">{a.title || 'Untitled'}</h4>
                <span className="text-xs text-gray-500">
                  {new Date(a.created_at).toLocaleString()}
                  {a.expires_at ? ` · Expires ${new Date(a.expires_at).toLocaleString()}` : ''}
                </span>
              </div>
              <p className="text-sm text-gray-300 mt-2 whitespace-pre-wrap">{a.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

