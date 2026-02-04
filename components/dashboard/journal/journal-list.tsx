'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/hooks/use-toast'

interface JournalEntry {
  id: string
  week_start: string
  week_end: string
  summary: string
  emotions: string
  strengths: string
  weaknesses: string
  next_focus: string
  xp_awarded: number
}

export function JournalList() {
  const [entries, setEntries] = useState<JournalEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [reflecting, setReflecting] = useState<string | null>(null)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/mentor/journal/list')
    const json = await res.json()
    if (res.ok) {
      setEntries(json.entries || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const submitReflection = async (journalId: string, text: string) => {
    setReflecting(journalId)
    const res = await fetch('/api/mentor/journal/reflect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ journal_id: journalId, reflection: text }),
    })
    const json = await res.json()
    if (!res.ok) {
      toast({ title: 'Error', description: json.error || 'Failed to save reflection', variant: 'destructive' })
    } else {
      toast({ title: 'Saved', description: 'Reflection saved.' })
    }
    setReflecting(null)
  }

  return (
    <Card className="bg-black border border-gold-500/40 p-6 rounded-2xl">
      <h2 className="text-2xl text-gold-400 font-bold mb-4">📓 Growth Journal</h2>
      {loading && <p className="text-gray-400">Loading...</p>}
      {!loading && entries.length === 0 && <p className="text-gray-400">No journal entries yet.</p>}
      {!loading &&
        entries.map((j) => (
          <div key={j.id} className="p-4 mb-5 rounded-xl bg-neutral-900 border border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-white font-semibold">
                Week of {new Date(j.week_start).toLocaleDateString()} - {new Date(j.week_end).toLocaleDateString()}
              </h3>
              <Badge className="bg-gold-500 text-black text-xs">XP +{j.xp_awarded}</Badge>
            </div>

            <p className="text-gray-300 whitespace-pre-line mb-3">{j.summary}</p>

            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-200">
              <div>
                <span className="text-gold font-semibold">💭 Emotions:</span> {j.emotions || '—'}
              </div>
              <div>
                <span className="text-gold font-semibold">💪 Strengths:</span> {j.strengths || '—'}
              </div>
              <div>
                <span className="text-gold font-semibold">⚠️ Weaknesses:</span> {j.weaknesses || '—'}
              </div>
              <div>
                <span className="text-gold font-semibold">🎯 Next Focus:</span> {j.next_focus || '—'}
              </div>
            </div>

            <div className="mt-3">
              <textarea
                className="w-full bg-neutral-800 text-white rounded-lg p-2 text-sm border border-gray-700"
                placeholder="Write your reflection..."
                onBlur={(e) => {
                  const text = e.target.value.trim()
                  if (text) submitReflection(j.id, text)
                }}
                disabled={reflecting === j.id}
              />
              <p className="text-xs text-gray-500 mt-1">Click outside the box to save.</p>
            </div>
          </div>
        ))}
    </Card>
  )
}

