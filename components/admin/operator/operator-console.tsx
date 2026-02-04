'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useToast } from '@/hooks/use-toast'

interface ActionRow {
  id: string
  category: string | null
  recommendation: string | null
  impact: string | null
  status: string
  auto_executable: boolean
  created_at: string
  executed_at: string | null
}

export function OperatorConsole() {
  const { toast } = useToast()
  const [actions, setActions] = useState<ActionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  const load = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/operator/logs')
    if (res.ok) {
      const json = await res.json()
      setActions(json.actions || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [])

  const runNow = async () => {
    setRunning(true)
    const res = await fetch('/api/admin/operator/run', { method: 'POST' })
    if (!res.ok) {
      toast({ title: 'Error', description: 'Run failed', variant: 'destructive' })
    } else {
      toast({ title: 'AI Operator run complete' })
      await load()
    }
    setRunning(false)
  }

  const updateStatus = async (id: string, action: 'approve' | 'execute' | 'dismiss') => {
    const res = await fetch('/api/admin/operator/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, action }),
    })
    if (!res.ok) {
      toast({ title: 'Error', description: 'Update failed', variant: 'destructive' })
    } else {
      await load()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-gray-300">
        <LoadingSpinner /> <span>Loading actions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Card className="bg-black border border-gold-500/50 p-4 rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl text-gold-400 font-bold">🧭 AI Autonomous Operator</h1>
            <p className="text-sm text-gray-400">Daily AI reports with recommended actions.</p>
          </div>
          <Button onClick={runNow} disabled={running} className="bg-gold-500 text-black hover:bg-gold-600">
            {running ? 'Running...' : 'Run Now'}
          </Button>
        </div>
      </Card>

      {actions.map((a) => (
        <Card
          key={a.id}
          className="bg-gray-950 border border-gray-800 p-4 rounded-2xl space-y-2"
        >
          <div className="flex items-center justify-between">
            <p className="text-gold-300 font-semibold">Category: {a.category || 'general'}</p>
            <span
              className={`text-xs px-2 py-1 rounded ${
                a.status === 'executed'
                  ? 'bg-green-600/20 text-green-200'
                  : a.status === 'pending'
                    ? 'bg-yellow-600/20 text-yellow-200'
                    : 'bg-gray-700 text-gray-200'
              }`}
            >
              {a.status}
            </span>
          </div>
          <p className="text-sm text-gray-200">{a.recommendation}</p>
          <p className="text-xs text-gray-500">Impact: {a.impact || 'medium'}</p>
          <div className="flex gap-2">
            <Button size="sm" className="bg-gold-500 text-black" onClick={() => updateStatus(a.id, 'approve')}>
              Approve
            </Button>
            <Button size="sm" variant="outline" className="border-gray-700 text-gray-200" onClick={() => updateStatus(a.id, 'execute')}>
              Execute
            </Button>
            <Button size="sm" variant="outline" className="border-gray-800 text-gray-400" onClick={() => updateStatus(a.id, 'dismiss')}>
              Dismiss
            </Button>
          </div>
        </Card>
      ))}

      {actions.length === 0 && <p className="text-sm text-gray-500">No actions yet.</p>}
    </div>
  )
}

