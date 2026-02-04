'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'

interface LogRow {
  id: string
  campaign_id: string
  old_roi: number | null
  new_roi: number | null
  recommendation: string | null
  adjustment: string | null
  created_at: string
}

export function OptimizerDashboard() {
  const { toast } = useToast()
  const [logs, setLogs] = useState<LogRow[]>([])
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      const [logRes, sumRes] = await Promise.all([fetch('/api/optimizer/logs'), fetch('/api/optimizer/summary')])
      if (logRes.ok) {
        const json = await logRes.json()
        setLogs(json.logs || [])
      }
      if (sumRes.ok) {
        const json = await sumRes.json()
        setSummary(json.summary || '')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const runNow = async () => {
    setRunning(true)
    try {
      const res = await fetch('/api/optimizer/run', { method: 'POST' })
      if (!res.ok) {
        const j = await res.json()
        throw new Error(j.error || 'Run failed')
      }
      toast({ title: 'Optimization run triggered' })
      await load()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message || 'Failed to run optimizer', variant: 'destructive' })
    } finally {
      setRunning(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="bg-black border border-gold-500/50 p-6 rounded-2xl space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl text-gold-400 font-bold">🧠 AI ROI Optimization Engine</h2>
            <p className="text-sm text-gray-400">Let your data guide your next move.</p>
          </div>
          <Button
            onClick={runNow}
            disabled={running}
            className="bg-gold-500 text-black hover:bg-gold-600 font-semibold"
          >
            {running ? 'Running...' : 'Run Now'}
          </Button>
        </div>
        <p className="text-xs text-gray-500">AI reviews active campaigns daily and suggests adjustments.</p>
      </Card>

      <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
        <h3 className="text-white font-semibold mb-2">Weekly Insights</h3>
        {summary ? (
          <p className="text-sm text-gray-200 whitespace-pre-wrap">{summary}</p>
        ) : (
          <p className="text-sm text-gray-500">{loading ? 'Loading...' : 'No summary yet.'}</p>
        )}
      </Card>

      <Card className="bg-gray-950 border border-gray-800 p-4 rounded-2xl">
        <h3 className="text-white font-semibold mb-3">Optimization History</h3>
        <div className="space-y-3">
          {logs.length === 0 && <p className="text-sm text-gray-500">{loading ? 'Loading...' : 'No optimizations yet.'}</p>}
          {logs.map((l) => (
            <div key={l.id} className="bg-gray-900 border border-gray-800 rounded-xl p-3">
              <div className="flex items-center justify-between">
                <p className="text-gold-300 font-semibold text-sm">Campaign: {l.campaign_id}</p>
                <p className="text-xs text-gray-500">{new Date(l.created_at).toLocaleString()}</p>
              </div>
              <p className="text-xs text-gray-400 mt-1">Old ROI: {(l.old_roi ?? 0).toFixed(1)}% → Target: {(l.new_roi ?? 0).toFixed(1)}%</p>
              <p className="text-sm text-gray-200 mt-1">Recommendation: {l.recommendation}</p>
              <p className="text-xs text-gray-500 italic mt-1">{l.adjustment}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

